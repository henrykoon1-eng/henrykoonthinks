import Link from 'next/link';

interface PostCardPost {
  slug: string;
  title: string;
  date: string;
  category: string | string[];
  excerpt: string;
  coverImage?: string;
}

interface PostCardProps {
  post: PostCardPost;
}

const categoryNames: Record<string, string> = {
  life: 'Life',
  faith: 'Faith',
  essays: 'Essays',
  'the-outdoors': 'The Outdoors',
  poetry: 'Poetry',
  reviews: 'Reviews',
};

export default function PostCard({ post }: PostCardProps) {
  const cats = Array.isArray(post.category) ? post.category : [post.category];

  return (
    <article className="group bg-white border border-stone-200 overflow-hidden hover:shadow-lg hover:border-brand-300 transition-all duration-300">
      {post.coverImage && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            {cats.map((cat, i) => (
              <span key={cat} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-stone-300">&middot;</span>}
                <Link
                  href={`/category/${cat}`}
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600 hover:text-brand-800 transition-colors"
                >
                  {categoryNames[cat] || cat}
                </Link>
              </span>
            ))}
          </div>
          {post.date && (
            <span className="text-stone-300">|</span>
          )}
          {post.date && (
            <time className="text-xs text-stone-400 uppercase tracking-wider">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>
        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-brand-700 transition-colors leading-tight">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <Link
          href={`/posts/${post.slug}`}
          className="inline-block mt-4 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors uppercase tracking-wider"
        >
          Read &rarr;
        </Link>
      </div>
    </article>
  );
}
