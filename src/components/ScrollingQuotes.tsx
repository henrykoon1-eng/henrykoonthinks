'use client';

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

export default function ScrollingQuotes({ quotes }: { quotes: Quote[] }) {
  // Double the quotes for seamless looping
  const doubled = [...quotes, ...quotes];

  return (
    <div className="overflow-hidden relative">
      <div className="flex animate-scroll gap-8 w-max items-center">
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
