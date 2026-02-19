import { getAllPostSlugs, getPostBySlug, getCategoryDisplayName } from '@/lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
  return {
    title: `${post.title} — Henry Koon Thinks`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const categoryDisplay = getCategoryDisplayName(post.category);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6 uppercase tracking-wider">
        <Link href="/" className="hover:text-brand-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/category/${post.category}`} className="hover:text-brand-700 transition-colors">
          {categoryDisplay}
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium truncate normal-case">{post.title}</span>
      </div>

      {/* Post Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href={`/category/${post.category}`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 hover:text-brand-800 transition-colors"
          >
            {categoryDisplay}
          </Link>
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
        className="prose text-stone-800 text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
      />

      {/* Comments */}
      <DisqusComments postSlug={params.slug} postTitle={post.title} />

      {/* Back Link */}
      <div className="mt-12 pt-8 border-t border-stone-200">
        <Link
          href={`/category/${post.category}`}
          className="text-brand-700 hover:text-brand-900 font-medium transition-colors uppercase tracking-wider text-sm"
        >
          &larr; More in {categoryDisplay}
        </Link>
      </div>
    </article>
  );
}
