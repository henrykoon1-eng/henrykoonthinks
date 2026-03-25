import { getAllPostSlugs, getPostBySlug, getCategoryDisplayName } from '@/lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostSubscribeForm from '@/components/PostSubscribeForm';
import DisqusComments from '@/components/DisqusComments';

interface PostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found' };

  const url = `https://henrythinks.com/posts/${params.slug}`;
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
      ...(post.coverImage && { images: [{ url: `https://henrythinks.com${post.coverImage}` }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      ...(post.coverImage && { images: [`https://henrythinks.com${post.coverImage}`] }),
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

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
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
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
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
          />
        </div>
      )}

      {/* Post Content */}
      <div
        className={`prose text-stone-800 text-lg leading-relaxed${!cats.includes('poetry') ? ' prose-indent' : ''}`}
        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
      />

      {/* Post Footer */}
      <div className="mt-14 pt-10 border-t border-stone-200">
        {/* Substack comment link for synced posts */}
        {post.substackUrl && (
          <div className="text-center mb-10">
            <a
              href={`${post.substackUrl}#comments`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 border border-stone-300 text-stone-700 text-sm font-medium tracking-wider uppercase hover:bg-stone-100 transition-colors"
              style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              Leave a comment on Substack
            </a>
          </div>
        )}

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

      {/* Comments */}
      <DisqusComments postSlug={params.slug} postTitle={post.title} />
    </article>
  );
}
