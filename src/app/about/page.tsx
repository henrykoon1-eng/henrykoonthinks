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
    </div>
  );
}
