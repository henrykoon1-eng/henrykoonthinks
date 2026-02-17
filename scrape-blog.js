const https = require('https');
const fs = require('fs');
const path = require('path');

// List of all post URLs to scrape
const posts = [
  { url: 'https://henrykoonthinks.blogspot.com/2024/07/life-is-story.html', date: '2024-07-19', title: 'Life is a Story' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/07/the-climb-of-worship.html', date: '2024-07-04', title: 'The Climb of Worship' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/07/a-letter-to-friend.html', date: '2024-07-03', title: 'To be Childlike: A letter to a Friend' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/07/many-faces-of-lion.html', date: '2024-07-01', title: 'Many Faces of the Lion' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/06/watching-from-bottom-meanish-poem.html', date: '2024-06-20', title: 'Watching from the Bottom: A (meanish) Poem' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/06/waking-in-woods-poem.html', date: '2024-06-20', title: 'Waking in Woods: A Poem' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/06/today-i-climbed-tree-short-poem.html', date: '2024-06-19', title: 'Today I Climbed a Tree: A Short Poem' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/06/faith-signaling-and-great-sin-of.html', date: '2024-06-09', title: '"Using Faith as a tool" The Great Sin of Christian Pride' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/06/a-letter-to-mentor.html', date: '2024-06-01', title: 'A Letter To A Mentor' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/05/god-as-holy-host_25.html', date: '2024-05-25', title: 'God as a Holy Host' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/05/trees-sunsets-and-rebirth-prayer.html', date: '2024-05-24', title: 'Trees, Sunsets and Rebirth: A Prayer' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/04/prayer-as-meditation-and-dialectic.html', date: '2024-04-22', title: 'Prayer as meditation and dialectic' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/04/the-tree-of-good-and-evil.html', date: '2024-04-09', title: 'The Tree of Life and the Perpetual Battle with Evil' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/03/what-is-education.html', date: '2024-03-12', title: 'What is Education' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/02/koon-studies-study-of-life-universe-and.html', date: '2024-02-28', title: 'Koon Studies (The Study of Life the Universe and Everything)' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/02/peaks-and-valleys.html', date: '2024-02-13', title: 'Peaks and Valleys: A Poem' },
  { url: 'https://henrykoonthinks.blogspot.com/2024/01/the-calling.html', date: '2024-01-29', title: 'The Calling: A Poem' },
  { url: 'https://henrykoonthinks.blogspot.com/2023/12/lost-at-sea.html', date: '2023-12-08', title: 'Lost at Sea: A Poem' },
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-')
    .substring(0, 50);
}

function categorizeByTitle(title) {
  const titleLower = title.toLowerCase();
  
  // Poetry detection
  if (titleLower.includes('poem')) return 'poetry';
  
  // Faith/religion detection
  const faithKeywords = ['prayer', 'worship', 'god', 'christian', 'faith', 'church', 'holy', 'elijah', 'moses', 'bible', 'sin', 'religion', 'host'];
  if (faithKeywords.some(kw => titleLower.includes(kw))) return 'faith';
  
  // The Outdoors detection
  const outdoorsKeywords = ['mountain', 'climb', 'tree', 'woods', 'forest', 'sea', 'valley', 'nature', 'hike', 'wilderness', 'woods'];
  if (outdoorsKeywords.some(kw => titleLower.includes(kw))) return 'the-outdoors';
  
  // Life detection
  const lifeKeywords = ['life', 'education', 'story', 'letter', 'friend', 'mentor', 'childlike'];
  if (lifeKeywords.some(kw => titleLower.includes(kw))) return 'life';
  
  // Essays detection
  const essayKeywords = ['essay', 'study', 'dialectic', 'meditation', 'philosophy', 'politics', 'narrative'];
  if (essayKeywords.some(kw => titleLower.includes(kw))) return 'essays';
  
  // Default to reviews
  return 'reviews';
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractContent(html) {
  // Simple regex extraction for post body
  const postBodyMatch = html.match(/<div[^>]*class=["']post-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (postBodyMatch) {
    let content = postBodyMatch[1];
    // Remove HTML tags
    content = content.replace(/<[^>]+>/g, ' ');
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();
    return content;
  }
  
  // Try entry-content
  const entryMatch = html.match(/<div[^>]*class=["']entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (entryMatch) {
    let content = entryMatch[1];
    content = content.replace(/<[^>]+>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();
    return content;
  }
  
  // Try article tag
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    let content = articleMatch[1];
    content = content.replace(/<[^>]+>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();
    return content;
  }
  
  return 'Content extraction failed. Please manually copy from the original blog.';
}

function createMarkdown(post, content) {
  const category = categorizeByTitle(post.title);
  const slug = slugify(post.title);
  const excerpt = content.substring(0, 150).replace(/\n/g, ' ').trim() + (content.length > 150 ? '...' : '');
  
  return {
    filename: `${slug}.md`,
    content: `---
title: "${post.title}"
date: "${post.date}"
category: "${category}"
excerpt: "${excerpt}"
---

# ${post.title}

*Originally published on [${post.date}](${post.url})*

${content}
`
  };
}

async function main() {
  const outputDir = path.join(process.cwd(), 'content', 'posts');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Scraping ${posts.length} posts from blogspot...\n`);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] Scraping: ${post.title}`);
    
    try {
      const html = await fetchHtml(post.url);
      const content = extractContent(html);
      const markdown = createMarkdown(post, content);
      
      const filepath = path.join(outputDir, markdown.filename);
      fs.writeFileSync(filepath, markdown.content, 'utf8');
      console.log(`  → Saved to ${markdown.filename}`);
    } catch (err) {
      console.error(`  → Error: ${err.message}`);
      // Create placeholder file
      const placeholder = createMarkdown(post, `Error fetching content. Please manually copy from: ${post.url}`);
      const filepath = path.join(outputDir, placeholder.filename);
      fs.writeFileSync(filepath, placeholder.content, 'utf8');
    }
  }
  
  console.log(`\nDone! Check ${outputDir}/ for the scraped posts.`);
}

main().catch(console.error);
