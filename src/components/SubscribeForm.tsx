'use client';

export default function SubscribeForm() {
  return (
    <section className="bg-stone-800 border-t border-stone-700">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-stone-100 mb-2 uppercase tracking-wider">
          Stay in the loop
        </h3>
        <p className="text-stone-400 text-sm mb-6">
          Get new posts delivered straight to your inbox. No spam, just thoughts.
        </p>

        <iframe
          src="https://henrykoon.substack.com/embed"
          width="100%"
          height="80"
          style={{ background: 'transparent', border: 'none', maxWidth: '480px' }}
          frameBorder="0"
          scrolling="no"
        />

        <p className="text-stone-500 text-xs mt-4">
          Powered by{' '}
          <a
            href="https://henrykoon.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-stone-200 transition-colors underline"
          >
            Substack
          </a>
        </p>
      </div>
    </section>
  );
}
