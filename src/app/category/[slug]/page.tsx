import { getAllCategories, getPostsByCategory, getCategoryDisplayName } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

interface CategoryPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllCategories().map((cat) => ({ slug: cat }));
}

export function generateMetadata({ params }: CategoryPageProps) {
  const displayName = getCategoryDisplayName(params.slug);
  return {
    title: `${displayName} — Henry Koon Thinks`,
    description: `Browse all ${displayName} posts on Henry Koon Thinks.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const displayName = getCategoryDisplayName(slug);
  const posts = getPostsByCategory(slug);
  const allCategories = getAllCategories();

  const categoryDescriptions: Record<string, string> = {
    life: 'Here are some things I think I learn as I stumble along',
    faith: 'My thoughts, questions, struggles, revelations and prayers',
    essays: "It's time I stop ranting and rage baiting, here's me trying to think",
    'the-outdoors': 'Tips from the trail, notes from the blind, talks with the trees, and arguments with bees',
    poetry: 'Yeats says "We must labor to be beautiful" and as I\'m not, here I shall try and fail',
  };

  const categoryImages: Record<string, string> = {
    poetry: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg',
    'the-outdoors': '/images/outdoors-hero.webp',
    essays: '/images/essays-hero.avif',
    faith: '/images/faith-hero.jpg',
    life: '/images/life-hero.avif',
  };

  const categoryPositions: Record<string, string> = {
    poetry: 'bg-[center_40%]',
    'the-outdoors': 'bg-[center_35%]',
    essays: 'bg-[center_70%]',
    faith: 'bg-[center_55%]',
    life: 'bg-[center_60%]',
  };

  const heroImage = categoryImages[slug] || '/images/default-hero.jpg';
  const bgPosition = categoryPositions[slug] || 'bg-center';

  return (
    <div>
      {/* Category Hero Banner */}
      <section className="relative h-[45vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover ${bgPosition}`}
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-stone-900/70" />
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-2 text-sm text-stone-300 mb-4 uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">{displayName}</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight uppercase drop-shadow-lg"
            style={{ letterSpacing: '0.08em' }}
          >
            {displayName}
          </h1>
          <div className="w-16 h-0.5 bg-brand-400 mx-auto mb-4" />
          <p className="text-lg text-stone-300 font-light max-w-xl mx-auto">
            {categoryDescriptions[slug] || `Posts in the ${displayName} category.`}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 sm:px-8 lg:px-16 py-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {allCategories.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat}`}
              className={`px-5 py-2 text-sm font-medium transition-all uppercase tracking-wider ${
                cat === slug
                  ? 'bg-stone-900 text-stone-100'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-stone-100 hover:border-stone-900'
              }`}
            >
              {getCategoryDisplayName(cat)}
            </Link>
          ))}
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200">
            <p className="text-stone-500 text-lg mb-2">No posts in {displayName} yet.</p>
            <p className="text-stone-400 text-sm">
              Add a Markdown file with <code className="bg-stone-100 px-2 py-0.5 rounded">category: {slug}</code> to see posts here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
