'use client';

export default function SubscribeForm() {
  return (
    <section className="bg-stone-900 border-t border-stone-800 py-10">
      <div className="max-w-md mx-auto px-4 text-center">
        <p className="text-stone-400 text-sm mb-4">
          Subscribe to get new posts by email.
        </p>
        <iframe
          src="https://blog.henrythinks.com/embed"
          width="100%"
          height="80"
          style={{ background: 'transparent', border: 'none' }}
          frameBorder="0"
          scrolling="no"
        />
      </div>
    </section>
  );
}
