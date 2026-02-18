'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface Quote {
  text: string;
  author: string;
  tag: string;
}

const tagColors: Record<string, string> = {
  faith: 'border-amber-400/40',
  life: 'border-blue-400/40',
  nature: 'border-emerald-400/40',
  wisdom: 'border-indigo-400/40',
};

const tagDots: Record<string, string> = {
  faith: 'bg-amber-400',
  life: 'bg-blue-400',
  nature: 'bg-emerald-400',
  wisdom: 'bg-indigo-400',
};

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
          className={`quote-card break-inside-avoid opacity-0 translate-y-6 transition-all duration-700 ease-out
            bg-white/80 backdrop-blur-sm rounded-lg p-6 border-l-4 ${tagColors[q.tag] || 'border-stone-300/40'}
            shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-shadow`}
          style={{ transitionDelay: `${(i % 6) * 100}ms` }}
        >
          <blockquote className="text-stone-700 italic leading-relaxed text-[15px] sm:text-base">
            &ldquo;{q.text}&rdquo;
          </blockquote>
          <div className="mt-3 flex items-center justify-between">
            <cite className="text-stone-500 text-sm not-italic font-medium">
              — {q.author}
            </cite>
            <span className={`w-2 h-2 rounded-full ${tagDots[q.tag] || 'bg-stone-300'}`} title={q.tag} />
          </div>
        </div>
      ))}
    </div>
  );
}
