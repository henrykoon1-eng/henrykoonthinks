import { getAllPostSlugs, getPostBySlug, getCategoryDisplayName, getSeriesPosts } from '@/lib/posts';
import { formatPostDate } from '@/lib/date';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostSubscribeForm from '@/components/PostSubscribeForm';
import Comments from '@/components/Comments';
import SeriesNav from '@/components/SeriesNav';
import PostLinkCards from '@/components/PostLinkCards';

// Human-readable names for collections keyed by the `series` frontmatter value.
const SERIES_TITLES: Record<string, string> = {
  pct: 'The PCT',
};

interface PostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found' };

  const url = `https://henrykoonthinks.com/posts/${params.slug}`;
  const title = `${post.title} — Henry Koon Thinks`;
  const description = post.excerpt || 'An essay by Henry Koon';

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: 'Henry Koon Thinks',
      type: 'article',
      ...(post.coverImage && { images: [{ url: `https://henrykoonthinks.com${post.coverImage}` }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      ...(post.coverImage && { images: [`https://henrykoonthinks.com${post.coverImage}`] }),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const cats = Array.isArray(post.category) ? post.category : [post.category];
  const primaryCategory = cats[0];

  // Series/collection navigation (e.g. the PCT chapters).
  const seriesPosts = post.series ? getSeriesPosts(post.series) : [];
  const seriesTitle = post.series ? SERIES_TITLES[post.series] || 'Series' : '';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://henrykoonthinks.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: getCategoryDisplayName(primaryCategory),
        item: `https://henrykoonthinks.com/category/${primaryCategory}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://henrykoonthinks.com/posts/${params.slug}`,
      },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Henry Koon',
      url: 'https://henrykoonthinks.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Henry Koon Thinks',
      url: 'https://henrykoonthinks.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://henrykoonthinks.com/posts/${params.slug}`,
    },
    ...(post.coverImage && { image: `https://henrykoonthinks.com${post.coverImage}` }),
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6 uppercase tracking-wider">
        <Link href="/" className="hover:text-brand-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/category/${primaryCategory}`} className="hover:text-brand-700 transition-colors">
          {getCategoryDisplayName(primaryCategory)}
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium truncate normal-case">{post.title}</span>
      </div>

      {/* Post Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            {cats.map((cat, i) => (
              <span key={cat} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-stone-300">&middot;</span>}
                <Link
                  href={`/category/${cat}`}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 hover:text-brand-800 transition-colors"
                >
                  {getCategoryDisplayName(cat)}
                </Link>
              </span>
            ))}
          </div>
          {post.date && (
            <time className="text-sm text-stone-400 uppercase tracking-wider">
              {formatPostDate(post.date)}
            </time>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 leading-tight mb-4">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-stone-600 leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-8 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Content */}
      <div
        className={`prose text-stone-800 text-lg leading-relaxed${!cats.includes('poetry') ? ' prose-indent' : ''}`}
        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
      />
      <PostLinkCards />

      {/* Series / collection navigation (e.g. the PCT chapters) */}
      {post.series && seriesPosts.length > 1 && (
        <SeriesNav posts={seriesPosts} currentSlug={params.slug} title={seriesTitle} />
      )}

      {/* Post Footer */}
      <div className="mt-14 pt-10 border-t border-stone-200">
        {/* Subscribe */}
        <div className="mb-10">
          <PostSubscribeForm />
        </div>

        {/* Read on Substack + Back navigation */}
        <div className="flex items-center justify-between text-sm" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
          <Link
            href={`/category/${primaryCategory}`}
            className="text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-wider"
          >
            &larr; More in {getCategoryDisplayName(primaryCategory)}
          </Link>
          {post.substackUrl && (
            <a
              href={post.substackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-wider"
            >
              Read on Substack &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Comments — ad-free (replaces Disqus, whose free tier injected ads) */}
      <Comments substackUrl={post.substackUrl} />
    </article>
  );
}
