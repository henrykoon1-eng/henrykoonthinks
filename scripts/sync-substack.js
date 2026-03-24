const https = require('https');
const fs = require('fs');
const path = require('path');

const SUBSTACK_FEED_URL = 'https://henrykoon.substack.com/feed';
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

// Fetch RSS feed
function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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

// Convert HTML to clean markdown
function htmlToMarkdown(html) {
  // Remove Substack subscribe widgets
  let text = html.replace(/<div class="subscription-widget[\s\S]*?<\/div><\/div><\/div>/gi, '');
  // Also remove any preamble text from Substack subscribe embeds
  text = text.replace(/<p class="cta-caption">[\s\S]*?<\/p>/gi, '');
  text = text.replace(/<div[^>]*data-component-name="SubscribeWidgetToDOM"[\s\S]*?<\/div>/gi, '');

  // Handle images
  text = text.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  text = text.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');

  // Handle headings
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');

  // Handle blockquotes
  text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    return '\n\n> ' + clean.split('\n').join('\n> ') + '\n\n';
  });

  // Handle lists
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // Handle links
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Handle bold/italic
  text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Handle paragraphs and breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#8217;/g, "'");
  text = text.replace(/&#8216;/g, "'");
  text = text.replace(/&#8220;/g, '"');
  text = text.replace(/&#8221;/g, '"');
  text = text.replace(/&#8230;/g, '...');
  text = text.replace(/&#8212;/g, '—');
  text = text.replace(/&#8211;/g, '–');
  text = text.replace(/&nbsp;/g, ' ');

  // Remove Substack boilerplate text
  text = text.replace(/Thanks for reading.*?Subscribe for free.*$/gim, '');
  text = text.replace(/Subscribe for free to receive.*$/gim, '');

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[\t ]+/g, ' ');

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
    if (synced.includes(link)) {
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
    const markdown = htmlToMarkdown(contentEncoded || description);

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
      `substackUrl: "${link}"`,
      '---',
    ].join('\n');

    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    // Don't overwrite existing posts
    if (fs.existsSync(filePath)) {
      console.log(`  Skipping (file exists): ${slug}.md`);
      synced.push(link);
      continue;
    }

    fs.writeFileSync(filePath, frontmatter + '\n\n' + markdown);
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
