const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'content/posts');
const siteUrl = 'https://henrykoonthinks.com';
const publicDir = path.join(process.cwd(), 'public');

function getAllPosts() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      const rawDate = data.date;
      const date = rawDate instanceof Date
        ? rawDate.toISOString().split('T')[0]
        : (rawDate ? String(rawDate).split('T')[0] : '');

      return {
        slug,
        title: data.title || slug,
        date,
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || null,
        draft: data.draft || false,
      };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => {
      const ta = Date.parse(a.date); const tb = Date.parse(b.date);
      return (Number.isNaN(tb) ? -Infinity : tb) - (Number.isNaN(ta) ? -Infinity : ta);
    });
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getImageUrl(coverImage) {
  if (!coverImage) return null;
  // If already a full URL, use as-is
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }
  // Otherwise prepend site URL
  return `${siteUrl}${coverImage}`;
}

const posts = getAllPosts();

// --- Generate RSS ---
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Henry Koon Thinks</title>
    <link>${siteUrl}</link>
    <description>Reflections on life, faith, the outdoors, and writing.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => {
          const imageUrl = getImageUrl(post.coverImage);
          return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid>${siteUrl}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt || '')}</description>
      ${imageUrl ? `<media:content url="${escapeXml(imageUrl)}" medium="image" />` : ''}
    </item>`;
        }
      )
      .join('')}
  </channel>
</rss>`;

// --- Generate Sitemap ---
const categories = ['life', 'faith', 'essays', 'the-outdoors', 'poetry', 'reviews'];
const today = new Date().toISOString().split('T')[0];
const latestPostDate = posts.length > 0 ? new Date(posts[0].date).toISOString().split('T')[0] : today;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${latestPostDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}/quotes</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${categories.map((cat) => `<url>
    <loc>${siteUrl}/category/${cat}</loc>
    <lastmod>${latestPostDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n  ')}
  ${posts.map((post) => {
    const postDate = post.date ? new Date(post.date).toISOString().split('T')[0] : today;
    return `<url>
    <loc>${siteUrl}/posts/${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n  ')}
</urlset>`;

// Write files
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss);
console.log('RSS feed generated successfully');

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('Sitemap generated successfully');
