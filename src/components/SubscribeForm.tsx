'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Mailchimp embedded form submission
      const formData = new FormData();
      formData.append('EMAIL', email);
      
      const res = await fetch('https://eepurl.com/jzxjt6', {
        method: 'POST',
        body: formData,
        mode: 'no-cors', // Mailchimp doesn't support CORS on embedded forms
      });

      // Since no-cors doesn't give us response details, assume success
      setStatus('success');
      setMessage("You're in. Check your inbox to confirm your subscription.");
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  };

  return (
    <section className="bg-stone-800 border-t border-stone-700">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h3
          className="text-xl sm:text-2xl font-bold text-stone-100 mb-2 uppercase tracking-wider"
        >
          Stay in the loop
        </h3>
        <p className="text-stone-400 text-sm mb-6">
          Get new posts delivered straight to your inbox. No spam, just thoughts.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
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
        {message && (
          <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
