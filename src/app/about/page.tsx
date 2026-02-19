import Link from 'next/link';

export const metadata = {
  title: 'About — Henry Koon Thinks',
  description: 'Learn more about Henry Koon and this blog.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">About</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">About</h1>

      <div className="prose text-gray-700 text-lg leading-relaxed space-y-4">
        <p>
          Welcome to <strong>Henry Koon Thinks</strong> — a personal blog where I share my
          reflections on life, faith, the great outdoors, and the craft of writing.
        </p>
        <p>
          This is a space for honest thinking. Whether it&apos;s an essay on something I&apos;ve been
          wrestling with, a poem that came together on a long hike, or a story from everyday
          life, I write to make sense of the world and to connect with others doing the same.
        </p>
        <p>
          Thanks for stopping by. I hope something here resonates with you.
        </p>
      </div>

      {/* Contact */}
      <section className="mt-12 pt-8 border-t border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider">Contact</h2>
        <p className="text-stone-700 leading-relaxed mb-4">
          Have a thought to share? Want to reach out? I&apos;d love to hear from you.
        </p>
        <a
          href="mailto:henrykoon1@gmail.com"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          henrykoon1@gmail.com
        </a>
      </section>
    </div>
  );
}
