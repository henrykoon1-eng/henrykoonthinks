const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'content', 'posts');

function fixYamlFrontmatter(content) {
  // Fix title field - escape quotes properly
  content = content.replace(/^title: "(.*)"/m, (match, title) => {
    // Remove any existing quotes and escape properly
    const cleanTitle = title.replace(/^"(.*)"$/, '$1').replace(/"/g, '\\"');
    return `title: "${cleanTitle}"`;
  });
  
  // Fix excerpt field - remove HTML entities and limit length
  content = content.replace(/^excerpt: "(.*)"/m, (match, excerpt) => {
    // Remove HTML entities and clean up
    const cleanExcerpt = excerpt
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 150);
    return `excerpt: "${cleanExcerpt}"`;
  });
  
  return content;
}

function fixAllPosts() {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  console.log(`Fixing ${files.length} markdown files...`);
  
  files.forEach(file => {
    const filepath = path.join(postsDir, file);
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const fixedFrontmatter = fixYamlFrontmatter(`---\n${frontmatter}\n---`);
      content = content.replace(/^---\n[\s\S]*?\n---/, fixedFrontmatter);
      
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`  Fixed: ${file}`);
    }
  });
  
  console.log('Done!');
}

fixAllPosts();
