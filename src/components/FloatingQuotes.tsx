'use client';

import { useEffect, useRef } from 'react';

interface Quote {
  text: string;
  author: string;
  tag: string;
}

export default function FloatingQuotes({ quotes, limit }: { quotes: Quote[]; limit?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const displayed = limit ? quotes.slice(0, limit) : quotes;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('quote-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const cards = containerRef.current?.querySelectorAll('.quote-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [displayed]);

  return (
    <div ref={containerRef} className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {displayed.map((q, i) => (
        <div
          key={i}
          className="quote-card break-inside-avoid opacity-0 translate-y-6 transition-all duration-700 ease-out
            bg-white/80 backdrop-blur-sm rounded-lg p-6 border-l-4 border-stone-300/40
            shadow-sm hover:shadow-md hover:-translate-y-0.5"
          style={{ transitionDelay: `${(i % 6) * 100}ms` }}
        >
          <blockquote className="text-stone-700 italic leading-relaxed text-[15px] sm:text-base">
            &ldquo;{q.text}&rdquo;
          </blockquote>
          <div className="mt-3">
            <cite className="text-stone-500 text-sm not-italic font-medium">
              — {q.author}
            </cite>
          </div>
        </div>
      ))}
    </div>
  );
}
