'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('https://henrykoon.substack.com/api/v1/free?nojs=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          first_url: 'https://blog.henrythinks.com/',
          first_referrer: 'https://henrythinks.com/',
          current_url: 'https://blog.henrythinks.com/',
          current_referrer: 'https://henrythinks.com/',
          email,
        }),
        mode: 'no-cors',
      });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="border-t border-stone-200 py-14">
      <div className="max-w-lg mx-auto px-4 text-center">
        <h3
          className="text-2xl font-semibold text-stone-900 mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Stay with the journey
        </h3>
        <p className="text-stone-500 text-sm mb-6" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
          New essays and reflections, delivered to your inbox. No spam.
        </p>

        {status === 'success' ? (
          <p className="text-stone-700 text-sm py-3">
            Thank you — check your email to confirm.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0 max-w-sm mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              className="flex-1 px-4 py-3 bg-white border border-stone-300 border-r-0 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-stone-500 transition-colors"
              style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-3 bg-stone-900 text-white text-sm font-medium tracking-wider uppercase hover:bg-stone-700 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-sm text-red-500" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
            Something went wrong. Try again.
          </p>
        )}

        <p className="text-stone-400 text-xs mt-4" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
          Powered by{' '}
          <a
            href="https://blog.henrythinks.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-stone-600 transition-colors"
          >
            Substack
          </a>
        </p>
      </div>
    </section>
  );
}
