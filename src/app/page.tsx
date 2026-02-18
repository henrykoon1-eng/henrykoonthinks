import { getAllPosts, getAllCategories, getCategoryDisplayName } from '@/lib/posts';
import Link from 'next/link';
import FilteredPosts from '@/components/FilteredPosts';
import ScrollingQuotes from '@/components/ScrollingQuotes';
import quotesData from '../../content/quotes.json';

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
      {/* Hero Section — just a smidge clearer and brighter */}
      <section className="relative h-[80vh] min-h-[550px] flex items-center justify-center overflow-hidden bg-stone-700">
        <img
          src="/images/home-hero.jpg"
          alt="Hiker walking toward mountains"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-800/30 via-stone-800/25 to-stone-800/35" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] drop-shadow-lg uppercase"
            style={{ letterSpacing: '0.08em', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}
          >
            Henry Koon Thinks
          </h1>
          <div className="w-20 h-0.5 bg-brand-400 mx-auto mb-6" />
          <p className="text-lg sm:text-xl text-white leading-relaxed font-light drop-shadow-sm">
            And here are some thoughts...
          </p>
        </div>
      </section>

      {/* Scrolling Quotes Banner */}
      <section className="bg-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-stone-400 text-sm uppercase tracking-widest">Some gems I&apos;ve found lately</h2>
            <Link href="/quotes" className="text-brand-400 text-sm uppercase tracking-wider hover:text-brand-300 transition-colors">
              View All →
            </Link>
          </div>
          <ScrollingQuotes quotes={quotesData.quotes} />
        </div>
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
