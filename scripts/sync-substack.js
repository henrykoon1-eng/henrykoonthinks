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

// Clean Substack HTML — strip subscribe widgets and boilerplate, keep everything else
function cleanSubstackHtml(html) {
  let text = html;

  // Remove Substack subscribe widgets — catch the entire widget block including all nested content
  text = text.replace(/<div[^>]*class="subscription-widget[\s\S]*?<\/form>\s*(<\/div>\s*)*(<\/div>)*/gi, '');
  text = text.replace(/<div[^>]*data-component-name="SubscribeWidgetToDOM"[\s\S]*?<\/div>/gi, '');
  text = text.replace(/<p class="cta-caption">[\s\S]*?<\/p>/gi, '');
  // Catch any remaining subscribe forms
  text = text.replace(/<form[^>]*class="subscription-widget[\s\S]*?<\/form>/gi, '');

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

// Parse category from title convention: [Category] Title
// e.g. "[Faith] My Post Title" → { category: 'faith', title: 'My Post Title' }
function parseTitleCategory(title) {
  const match = title.match(/^\[([^\]]+)\]\s*(.*)/);
  if (match) {
    const rawCats = match[1].split(',').map(c => c.trim().toLowerCase().replace(/ /g, '-'));
    return { categories: rawCats, title: match[2] };
  }
  return { categories: ['essays'], title };
}

async function main() {
  console.log('Fetching Substack RSS feed...');
  const xml = await fetchFeed(SUBSTACK_FEED_URL);

  // Split into items
  const items = xml.split('<item>').slice(1);
  console.log(`Found ${items.length} posts in feed`);

  const synced = loadSynced();
  let newCount = 0;

  for (const item of items) {
    const link = getTag(item, 'link') || getTag(item, 'guid');
    // Normalize URLs so both old substack and new custom domain match
    const normalizedLink = link.replace('blog.henrythinks.com', 'henrykoon.substack.com');
    const normalizedSynced = synced.map(u => u.replace('blog.henrythinks.com', 'henrykoon.substack.com'));
    if (normalizedSynced.includes(normalizedLink)) {
      console.log(`  Skipping (already synced): ${link}`);
      continue;
    }

    const rawTitle = getTag(item, 'title');
    const { categories, title } = parseTitleCategory(rawTitle);
    const description = getTag(item, 'description');
    const pubDate = getTag(item, 'pubDate');
    const contentEncoded = getTag(item, 'content:encoded');

    const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const slug = slugify(title);
    const cleanHtml = cleanSubstackHtml(contentEncoded || description);

    // Build frontmatter
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
      `format: "html"`,
      '---',
    ].join('\n');

    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    // Don't overwrite existing posts
    if (fs.existsSync(filePath)) {
      console.log(`  Skipping (file exists): ${slug}.md`);
      synced.push(link);
      continue;
    }

    fs.writeFileSync(filePath, frontmatter + '\n\n' + cleanHtml);
    synced.push(link);
    newCount++;
    console.log(`  Created: ${slug}.md`);
  }

  saveSynced(synced);
  console.log(`\nDone. ${newCount} new post(s) synced.`);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
