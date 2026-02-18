import FloatingQuotes from '@/components/FloatingQuotes';
import quotes from '../../../content/quotes.json';

export default function QuotesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-900 py-16 text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold text-stone-100 uppercase tracking-wider mb-4"
          style={{ letterSpacing: '0.1em' }}
        >
          Quotes
        </h1>
        <div className="w-16 h-0.5 bg-brand-400 mx-auto mb-4" />
        <p className="text-stone-400 text-lg max-w-xl mx-auto px-6">
          Words that have shaped my thinking, stirred my soul, or simply made me pause.
        </p>
      </section>

      {/* Quotes Grid */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-stone-50 min-h-screen">
        <FloatingQuotes quotes={quotes} />
      </section>
    </div>
  );
}
