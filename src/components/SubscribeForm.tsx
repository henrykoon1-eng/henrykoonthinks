'use client';

import { useEffect } from 'react';

export default function SubscribeForm() {
  useEffect(() => {
    // Load MailerLite universal script
    if (typeof window !== 'undefined' && !(window as any).ml) {
      (function(w: any, d: Document, e: string, u: string, f: string) {
        w[f] = w[f] || function() {
          (w[f].q = w[f].q || []).push(arguments);
        };
        const l = d.createElement(e) as HTMLScriptElement;
        l.async = true;
        l.src = u;
        const n = d.getElementsByTagName(e)[0];
        n.parentNode?.insertBefore(l, n);
      })(window, document, 'script', 'https://assets.mailerlite.com/js/universal.js', 'ml');
      (window as any).ml('account', '2143341');
    }
  }, []);

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
        <div className="ml-embedded" data-form="180410029724141364"></div>
      </div>
    </section>
  );
}
