import { getAllPosts, getAllCategories, getCategoryDisplayName } from '@/lib/posts';
import Link from 'next/link';
import FilteredPosts from '@/components/FilteredPosts';

export default function HomePage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  const postsData = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: p.category,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
  }));

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c, getCategoryDisplayName(c)])
  );

  return (
    <div>
      {/* Hero Section — much darker background */}
      <section className="relative h-[80vh] min-h-[550px] flex items-center justify-center overflow-hidden bg-black">
        <img
          src="/images/home-hero.jpg"
          alt="Hiker walking toward mountains"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] drop-shadow-lg uppercase"
            style={{ letterSpacing: '0.08em' }}
          >
            Henry Koon Thinks
          </h1>
          <div className="w-20 h-0.5 bg-brand-400 mx-auto mb-6" />
          <p className="text-lg sm:text-xl text-stone-200 leading-relaxed font-light">
            And here are some thoughts...
          </p>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="bg-stone-900 py-8 text-center">
        <blockquote className="max-w-3xl mx-auto px-6">
          <p className="text-stone-400 italic text-lg sm:text-xl leading-relaxed">
            &ldquo;The world is charged with the grandeur of God.&rdquo;
          </p>
          <cite className="text-stone-600 text-sm mt-2 block not-italic tracking-wider uppercase">
            Gerard Manley Hopkins
          </cite>
        </blockquote>
      </section>

      {/* Latest Articles with Category Tabs */}
      <section className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-stone-300" />
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 uppercase tracking-wider text-center">
            Latest
          </h2>
          <div className="h-px flex-1 bg-stone-300" />
        </div>

        <FilteredPosts posts={postsData} categories={categories} categoryMap={categoryMap} />
      </section>
    </div>
  );
}
