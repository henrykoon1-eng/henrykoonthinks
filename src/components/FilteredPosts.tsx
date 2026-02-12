'use client';

import { useState } from 'react';
import Link from 'next/link';
import PostCard from '@/components/PostCard';

interface PostItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  coverImage?: string;
}

interface FilteredPostsProps {
  posts: PostItem[];
  categories: string[];
  categoryMap: Record<string, string>;
}

export default function FilteredPosts({ posts, categories, categoryMap }: FilteredPostsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-2 text-sm font-medium uppercase tracking-wider transition-all ${
            activeCategory === null
              ? 'bg-stone-900 text-stone-100'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-stone-100 hover:border-stone-900'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-sm font-medium uppercase tracking-wider transition-all ${
              activeCategory === cat
                ? 'bg-stone-900 text-stone-100'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-stone-100 hover:border-stone-900'
            }`}
          >
            {categoryMap[cat] || cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200">
          <p className="text-stone-500 text-lg mb-2">No posts yet.</p>
          <p className="text-stone-400 text-sm">
            Add Markdown files to the <code className="bg-stone-100 px-2 py-0.5 rounded">content/posts/</code> folder to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Post (first in filtered list) */}
          <div className="mb-10">
            <article className="group relative bg-stone-900 overflow-hidden">
              <div className="p-8 sm:p-12">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400 mb-3 block">
                  {categoryMap[filtered[0].category] || filtered[0].category}
                </span>
                <Link href={`/posts/${filtered[0].slug}`}>
                  <h3 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-4 group-hover:text-brand-300 transition-colors leading-tight">
                    {filtered[0].title}
                  </h3>
                </Link>
                {filtered[0].excerpt && (
                  <p className="text-stone-400 leading-relaxed mb-6 max-w-3xl">
                    {filtered[0].excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  {filtered[0].date && (
                    <time className="text-xs text-stone-600 uppercase tracking-wider">
                      {new Date(filtered[0].date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  <Link
                    href={`/posts/${filtered[0].slug}`}
                    className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-wider"
                  >
                    Read &rarr;
                  </Link>
                </div>
              </div>
            </article>
          </div>

          {/* Remaining Posts Grid */}
          {filtered.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(1).map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
