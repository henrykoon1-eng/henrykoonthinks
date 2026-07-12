import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  category: string | string[];
  excerpt: string;
  coverImage?: string;
  substackUrl?: string;
  draft?: boolean;
  contentHtml?: string;
  // Series/collection support (e.g. the PCT chapters). `series` is a stable
  // key shared by every post in the collection; `seriesOrder` sets reading order.
  series?: string;
  seriesOrder?: number;
}

export function getAllCategories(): string[] {
  return ['life', 'faith', 'essays', 'the-outdoors', 'poetry', 'reviews'];
}

export function getCategoryDisplayName(slug: string): string {
  const map: Record<string, string> = {
    life: 'Life',
    faith: 'Faith',
    essays: 'Essays',
    'the-outdoors': 'The Outdoors',
    poetry: 'Poetry',
    reviews: 'Reviews',
  };
  return map[slug] || slug;
}

export function getAllPosts(): PostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
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
        category: data.category || 'life',
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || undefined,
        draft: data.draft || false,
        series: data.series || undefined,
        seriesOrder: typeof data.seriesOrder === 'number' ? data.seriesOrder : undefined,
      };
    })
    .filter((post) => !post.draft);

  // Newest first. Sort by actual timestamp so malformed/odd dates can't scramble
  // the order; anything unparseable sorts to the bottom rather than the top.
  const time = (d: string) => {
    const t = Date.parse(d);
    return Number.isNaN(t) ? -Infinity : t;
  };
  return allPosts.sort((a, b) => time(b.date) - time(a.date));
}

export function getPostsByCategory(category: string): PostData[] {
  return getAllPosts().filter((post) => {
    const cats = Array.isArray(post.category) ? post.category : [post.category];
    return cats.includes(category);
  });
}

// All posts in a collection (e.g. "pct"), ordered by seriesOrder ascending so
// readers move Chapter 1 -> 2 -> 3. Falls back to date order if seriesOrder is
// missing on a post.
export function getSeriesPosts(series: string): PostData[] {
  return getAllPosts()
    .filter((post) => post.series === series)
    .sort((a, b) => {
      const ao = a.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.date < b.date ? -1 : 1;
    });
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => {
      const fullPath = path.join(postsDirectory, f);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return !data.draft;
    })
    .map((f) => f.replace(/\.md$/, ''));
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  let contentHtml: string;

  if (data.format === 'html') {
    // Substack-synced posts: content is already clean HTML, use directly
    contentHtml = content.trim();
  } else {
    // Regular markdown posts: strip leading whitespace and process with remark
    const cleanContent = content.replace(/^[\t ]+/gm, '');
    const processedContent = await remark().use(html).process(cleanContent);
    contentHtml = processedContent.toString();
  }

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    category: data.category || 'life',
    excerpt: data.excerpt || '',
    coverImage: data.coverImage || undefined,
    substackUrl: data.substackUrl || undefined,
    series: data.series || undefined,
    seriesOrder: typeof data.seriesOrder === 'number' ? data.seriesOrder : undefined,
    contentHtml,
  };
}
