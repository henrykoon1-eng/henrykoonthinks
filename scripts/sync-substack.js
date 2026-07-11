const https = require('https');
const fs = require('fs');
const path = require('path');

const SUBSTACK_FEED_URL = 'https://blog.henrythinks.com/feed';
const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts');
const SYNC_FILE = path.join(__dirname, '..', '.substack-synced.json');

// Load list of already-synced post URLs
function loadSynced() {
  if (fs.existsSync(SYNC_FILE)) {
    return JSON.parse(fs.readFileSync(SYNC_FILE, 'utf8'));
  }
  return [];
}

function saveSynced(synced) {
  fs.writeFileSync(SYNC_FILE, JSON.stringify(synced, null, 2));
}

// Fetch RSS feed (follows redirects)
function fetchFeed(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && maxRedirects > 0) {
        return resolve(fetchFeed(res.headers.location, maxRedirects - 1));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Simple XML tag extractor
function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
    || xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

// Extract cover image URL from <enclosure> tag within an item
function getEnclosureUrl(itemXml) {
  const match = itemXml.match(/<enclosure\s+url="([^"]+)"/i);
  return match ? match[1] : null;
}

// Get the channel-level newsletter avatar URL so we can skip it as a cover image
function getChannelImageUrl(fullXml) {
  const channelSection = fullXml.substring(0, fullXml.indexOf('<item>'));
  const match = channelSection.match(/<image>[\s\S]*?<url>([^<]+)<\/url>/i);
  return match ? match[1].trim() : null;
}

// Clean Substack HTML — strip subscribe widgets and boilerplate, keep everything else
function cleanSubstackHtml(html) {
  let text = html;

  // Remove Substack subscribe widgets
  text = text.replace(/<div[^>]*class="subscription-widget[\s\S]*?<\/form>\s*(<\/div>\s*)*(<\/div>)*/gi, '');
  text = text.replace(/<div[^>]*data-component-name="SubscribeWidgetToDOM"[\s\S]*?<\/div>/gi, '');
  text = text.replace(/<p class="cta-caption">[\s\S]*?<\/p>/gi, '');
  text = text.replace(/<form[^>]*class="subscription-widget[\s\S]*?<\/form>/gi, '');

  // Remove Substack call-to-action button paragraphs (Subscribe, Share, Leave a comment)
  text = text.replace(/<p[^>]*class="button-wrapper"[^>]*>[\s\S]*?<\/p>/gi, '');

  // Convert image gallery embeds to plain <img> tags
  text = text.replace(/<div[^>]*class="image-gallery-embed"[^>]*data-attrs="([^"]*)"[^>]*>[\s\S]*?<\/div>/gi, (match, attrs) => {
    try {
      const decoded = attrs.replace(/&quot;/g, '"');
      const parsed = JSON.parse(decoded);
      const src = parsed?.gallery?.images?.[0]?.src;
      return src ? `<img src="${src}" alt="" />` : '';
    } catch {
      return '';
    }
  });

  // Remove tab entities that Substack inserts
  text = text.replace(/&#9;/g, '');
  text = text.replace(/&#x9;/g, '');

  // Clean up orphaned closing div tags and empty paragraphs
  text = text.replace(/<\/div>\s*<\/div>\s*(?=<p>)/gi, '');
  text = text.replace(/<p>\s*<\/p>/gi, '');

  return text.trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}

// The site's real categories
const VALID_CATEGORIES = ['life', 'faith', 'essays', 'the-outdoors', 'poetry', 'reviews'];

// Shorthand tags that map to a real category. Add your own here.
// e.g. "pct" lets you write [PCT] and have it land in The Outdoors.
const CATEGORY_ALIASES = {
  pct: 'the-outdoors',
  outdoors: 'the-outdoors',
  hiking: 'the-outdoors',
  review: 'reviews',
  essay: 'essays',
  poem: 'poetry',
};

function resolveCategory(raw) {
  const key = raw.trim().toLowerCase().replace(/ /g, '-');
  return CATEGORY_ALIASES[key] || key;
}

// Look for a [Tag] at the start of a string. Only treats it as a category tag
// if every part resolves to a real category (so a subtitle that just happens to
// start with brackets is left alone). Returns { categories, rest } or null.
function extractCategoryTag(text) {
  const match = (text || '').match(/^\s*\[([^\]]+)\]\s*([\s\S]*)/);
  if (!match) return null;
  const parts = match[1].split(',').map(s => s.trim()).filter(Boolean);
  const resolved = parts.map(resolveCategory);
  if (resolved.length && resolved.every(c => VALID_CATEGORIES.includes(c))) {
    return { categories: resolved, rest: match[2].trim() };
  }
  return null;
}

// Keyword rules for auto-categorizing posts that have NO explicit [Tag].
// This lets you title posts naturally on Substack (no brackets) and still have
// them land in the right section. Rules are checked top to bottom — the FIRST
// rule with a matching keyword wins, so put the most specific/intentional
// signals first. Matching is case-insensitive and on whole words.
// Add or reorder keywords freely.
const KEYWORD_RULES = [
  { category: 'the-outdoors', keywords: ['pct'] },
  { category: 'poetry',       keywords: ['poem', 'poetry'] },
  { category: 'reviews',      keywords: ['review'] },
  { category: 'faith',        keywords: ['prayer', 'worship', 'gospel', 'christian', 'faith', 'church', 'holy', 'bible', 'sermon', 'sacred', 'jesus'] },
  { category: 'the-outdoors', keywords: ['hike', 'hiking', 'trail', 'mountain', 'wilderness', 'backpack', 'summit', 'camp', 'woods', 'forest'] },
];

function matchesKeyword(haystack, kw) {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}

function inferCategoryFromKeywords(text) {
  const haystack = text || '';
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => matchesKeyword(haystack, kw))) {
      return rule.category;
    }
  }
  return null;
}

// Determine categories from a post, in priority order:
//   1. Explicit [Tag] at the start of the subtitle (Substack RSS <description>)
//   2. Explicit [Tag] at the start of the title
//   3. Keyword inference from the title + subtitle (e.g. "PCT" → the-outdoors)
//   4. Default → essays
// Any explicit [Tag] is stripped so it never shows up in the post.
function parseCategory({ title, description }) {
  const fromSubtitle = extractCategoryTag(description);
  const fromTitle = extractCategoryTag(title);

  const cleanTitle = fromTitle ? fromTitle.rest : title;
  const cleanDescription = fromSubtitle ? fromSubtitle.rest : description;

  let categories =
    (fromSubtitle && fromSubtitle.categories) ||
    (fromTitle && fromTitle.categories);

  if (!categories) {
    const inferred = inferCategoryFromKeywords(`${cleanTitle} ${cleanDescription}`);
    if (inferred) categories = [inferred];
  }

  if (!categories) categories = ['essays'];

  return { categories, title: cleanTitle, description: cleanDescription };
}

async function main() {
  console.log('Fetching Substack RSS feed...');
  const xml = await fetchFeed(SUBSTACK_FEED_URL);

  const channelImageUrl = getChannelImageUrl(xml);

  const items = xml.split('<item>').slice(1);
  console.log(`Found ${items.length} posts in feed`);

  const synced = loadSynced();
  let newCount = 0;

  // Set of Substack URLs already represented by a file on disk (matched via the
  // substackUrl in each post's frontmatter). This is the real source of truth:
  // it lets a post whose title/slug changed on Substack be recognized instead of
  // recreated as a duplicate under the new slug, and it heals cases where the
  // synced list lost track of a file.
  const existingUrls = new Set();
  for (const f of fs.readdirSync(POSTS_DIR)) {
    if (!f.endsWith('.md')) continue;
    const m = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8')
      .match(/^substackUrl:\s*"?([^"\n]+)"?/m);
    if (m) existingUrls.add(m[1].trim().replace('blog.henrythinks.com', 'henrykoon.substack.com'));
  }

  for (const item of items) {
    const link = getTag(item, 'link') || getTag(item, 'guid');
    // Normalize URLs so both old substack and new custom domain match
    const normalizedLink = link.replace('blog.henrythinks.com', 'henrykoon.substack.com');

    const rawTitle = getTag(item, 'title');
    const rawDescription = getTag(item, 'description');
    const { categories, title, description } = parseCategory({ title: rawTitle, description: rawDescription });
    const pubDate = getTag(item, 'pubDate');
    const contentEncoded = getTag(item, 'content:encoded');

    const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const slug = slugify(title);
    const cleanHtml = cleanSubstackHtml(contentEncoded || description);

    // Cover image: use enclosure only if it's not the newsletter avatar
    const enclosureUrl = getEnclosureUrl(item);
    const coverImage = (enclosureUrl && enclosureUrl !== channelImageUrl) ? enclosureUrl : null;

    const catYaml = categories.length === 1
      ? `category: "${categories[0]}"`
      : `category:\n${categories.map(c => `  - "${c}"`).join('\n')}`;

    const frontmatter = [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: "${date}"`,
      catYaml,
      `excerpt: "${(description || '').replace(/"/g, '\\"').substring(0, 200)}"`,
      `substackUrl: "${link.replace('henrykoon.substack.com', 'blog.henrythinks.com')}"`,
      coverImage ? `coverImage: "${coverImage}"` : null,
      `format: "html"`,
      '---',
    ].filter(Boolean).join('\n');

    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    // Skip if a file for this exact slug already exists (don't overwrite edits).
    if (fs.existsSync(filePath)) {
      if (!synced.includes(link)) synced.push(link);
      console.log(`  Skipping (file exists): ${slug}.md`);
      continue;
    }

    // Skip if another file already covers this Substack URL under a different
    // slug — happens when the post's title changed on Substack. Prevents dupes.
    if (existingUrls.has(normalizedLink)) {
      if (!synced.includes(link)) synced.push(link);
      console.log(`  Skipping (already synced under a different slug): ${slug}.md`);
      continue;
    }

    // Genuinely new post (no slug file, no URL match) — create it. This also
    // heals posts wrongly marked synced without a file, e.g. PCT Chapter 6.
    fs.writeFileSync(filePath, frontmatter + '\n\n' + cleanHtml);
    if (!synced.includes(link)) synced.push(link);
    existingUrls.add(normalizedLink);
    newCount++;
    console.log(`  Created: ${slug}.md${coverImage ? ' (with cover image)' : ''}`);
  }

  saveSynced(synced);
  console.log(`\nDone. ${newCount} new post(s) synced.`);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
