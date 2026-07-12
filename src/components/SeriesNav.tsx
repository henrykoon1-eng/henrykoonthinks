import Link from 'next/link';
import type { PostData } from '@/lib/posts';

interface SeriesNavProps {
  /** Every post in the collection, already ordered by seriesOrder. */
  posts: PostData[];
  /** Slug of the post currently being read. */
  currentSlug: string;
  /** Human-readable name of the collection, e.g. "The PCT". */
  title: string;
}

/**
 * Renders a collection panel for a multi-part series (like the PCT chapters):
 * a full chapter list with the current entry highlighted, plus prev/next links
 * so readers can move Chapter 1 -> 2 -> 3 without going back to the category.
 */
export default function SeriesNav({ posts, currentSlug, title }: SeriesNavProps) {
  if (posts.length < 2) return null;

  const index = posts.findIndex((p) => p.slug === currentSlug);
  const prev = index > 0 ? posts[index - 1] : null;
  const next = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;

  return (
    <nav
      aria-label={`${title} series navigation`}
      className="mt-14 border border-stone-200 bg-stone-50"
    >
      <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          {title} &middot; A Collection
        </span>
        <span className="text-xs text-stone-400 uppercase tracking-wider">
          {index >= 0 ? `${index + 1} of ${posts.length}` : `${posts.length} parts`}
        </span>
      </div>

      <ol className="divide-y divide-stone-200">
        {posts.map((p, i) => {
          const isCurrent = p.slug === currentSlug;
          // Label by the post's own chapter number when we have one (0 = intro),
          // so the list reads Intro, Ch 1, Ch 2 ... rather than a raw index.
          const label =
            typeof p.seriesOrder === 'number'
              ? p.seriesOrder === 0
                ? 'Intro'
                : `Ch ${p.seriesOrder}`
              : String(i + 1).padStart(2, '0');
          return (
            <li key={p.slug}>
              <Link
                href={`/posts/${p.slug}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={`flex items-baseline gap-3 px-5 py-3 text-sm transition-colors ${
                  isCurrent
                    ? 'bg-white text-stone-900 font-semibold cursor-default'
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                <span className="text-xs uppercase tracking-wider text-stone-400 w-12 shrink-0">
                  {label}
                </span>
                <span className="leading-snug">{p.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {(prev || next) && (
        <div className="grid grid-cols-2 border-t border-stone-200">
          {prev ? (
            <Link
              href={`/posts/${prev.slug}`}
              className="px-5 py-4 border-r border-stone-200 hover:bg-white transition-colors group"
            >
              <span className="block text-xs uppercase tracking-wider text-stone-400 mb-1">
                &larr; Previous
              </span>
              <span className="block text-sm text-stone-700 group-hover:text-stone-900 leading-snug line-clamp-2">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span className="px-5 py-4 border-r border-stone-200" />
          )}
          {next ? (
            <Link
              href={`/posts/${next.slug}`}
              className="px-5 py-4 text-right hover:bg-white transition-colors group"
            >
              <span className="block text-xs uppercase tracking-wider text-stone-400 mb-1">
                Next &rarr;
              </span>
              <span className="block text-sm text-stone-700 group-hover:text-stone-900 leading-snug line-clamp-2">
                {next.title}
              </span>
            </Link>
          ) : (
            <span className="px-5 py-4" />
          )}
        </div>
      )}
    </nav>
  );
}
