'use client';

import { useMemo, useRef, useEffect, useState } from 'react';

interface Quote {
  text: string;
  author: string;
}

function getWidth(len: number) {
  if (len < 80) return 'max-w-xs';
  if (len < 160) return 'max-w-sm';
  if (len < 280) return 'max-w-md';
  return 'max-w-lg';
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Pixels per second — lower = slower
const SCROLL_SPEED = 30;

export default function ScrollingQuotes({ quotes }: { quotes: Quote[] }) {
  const shuffled = useMemo(() => shuffle(quotes), [quotes]);
  const doubled = [...shuffled, ...shuffled];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(120);

  useEffect(() => {
    if (scrollRef.current) {
      const halfWidth = scrollRef.current.scrollWidth / 2;
      setDuration(halfWidth / SCROLL_SPEED);
    }
  }, [quotes]);

  return (
    <div className="overflow-hidden relative">
      <div
        ref={scrollRef}
        className="flex scroll-strip gap-8 w-max items-center"
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((q, i) => (
          <div
            key={i}
            className={`flex-shrink-0 ${getWidth(q.text.length)} px-6 py-4`}
          >
            <blockquote className="text-stone-300 italic text-sm leading-relaxed">
              &ldquo;{q.text}&rdquo;
            </blockquote>
            <cite className="text-stone-500 text-xs not-italic font-medium mt-1 block">
              — {q.author}
            </cite>
          </div>
        ))}
      </div>
    </div>
  );
}
