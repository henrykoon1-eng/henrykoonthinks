const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'content', 'posts');

function cleanYamlValue(value) {
  // Remove all problematic characters and clean up
  return value
    .replace(/["\\]/g, '') // Remove quotes and backslashes
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 150);
}

function fixYamlFrontmatter(content) {
  // Use single quotes to avoid escape issues
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return content;
  
  let frontmatter = frontmatterMatch[1];
  
  // Extract and clean each field
  const titleMatch = frontmatter.match(/title:\s*"(.*)"/);
  const dateMatch = frontmatter.match(/date:\s*"(.*)"/);
  const categoryMatch = frontmatter.match(/category:\s*"(.*)"/);
  const excerptMatch = frontmatter.match(/excerpt:\s*"(.*)"/);
  
  let newFrontmatter = '---\n';
  
  if (titleMatch) {
    newFrontmatter += `title: '${cleanYamlValue(titleMatch[1])}'\n`;
  }
  
  if (dateMatch) {
    newFrontmatter += `date: '${dateMatch[1]}'\n`;
  }
  
  if (categoryMatch) {
    newFrontmatter += `category: '${categoryMatch[1]}'\n`;
  }
  
  if (excerptMatch) {
    newFrontmatter += `excerpt: '${cleanYamlValue(excerptMatch[1])}'\n`;
  }
  
  newFrontmatter += '---';
  
  return content.replace(/^---\n[\s\S]*?\n---/, newFrontmatter);
}

function fixAllPosts() {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  console.log(`Fixing ${files.length} markdown files...`);
  
  files.forEach(file => {
    const filepath = path.join(postsDir, file);
    let content = fs.readFileSync(filepath, 'utf8');
    
    content = fixYamlFrontmatter(content);
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  Fixed: ${file}`);
  });
  
  console.log('Done!');
}

fixAllPosts();
