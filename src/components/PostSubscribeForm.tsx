'use client';

import { useState } from 'react';

export default function PostSubscribeForm() {
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

  if (status === 'success') {
    return (
      <div className="text-center py-2">
        <p className="text-stone-600 text-sm" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
          Thank you — check your email to confirm.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-stone-500 text-sm mb-3" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
        Enjoyed this? Get new posts in your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-0 max-w-xs mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className="flex-1 px-3 py-2.5 bg-white border border-stone-300 border-r-0 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-stone-500 transition-colors"
          style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2.5 bg-stone-900 text-white text-sm font-medium tracking-wider uppercase hover:bg-stone-700 transition-colors disabled:opacity-50"
          style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-500" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}
