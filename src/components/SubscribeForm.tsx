'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await fetch(
        'https://assets.mailerlite.com/jsonp/2143341/forms/180410029724141364/subscribe',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'fields[email]': email,
            'ml-submit': '1',
            'anticsrf': 'true',
          }),
          mode: 'no-cors',
        }
      );

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="bg-stone-800 border-t border-stone-700">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-stone-100 mb-2 uppercase tracking-wider">
          Stay in the loop
        </h3>
        <p className="text-stone-400 text-sm mb-6">
          Get new posts delivered straight to your inbox. No spam, just thoughts.
        </p>

        {status === 'success' ? (
          <p className="text-green-400 text-sm">Thank you! You have successfully joined.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="email"
              className="flex-1 px-4 py-3 bg-stone-900 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-brand-400 transition-colors text-sm"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-stone-100 text-stone-900 font-medium text-sm uppercase tracking-wider hover:bg-brand-300 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-4 text-sm text-red-400">Something went wrong. Try again.</p>
        )}
      </div>
    </section>
  );
}
