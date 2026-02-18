'use client';

interface Quote {
  text: string;
  author: string;
  tag: string;
}

export default function ScrollingQuotes({ quotes }: { quotes: Quote[] }) {
  // Double the quotes for seamless looping
  const doubled = [...quotes, ...quotes];

  return (
    <div className="overflow-hidden relative">
      <div className="flex animate-scroll gap-8 w-max">
        {doubled.map((q, i) => (
          <div
            key={i}
            className="flex-shrink-0 max-w-xs px-6 py-4"
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
