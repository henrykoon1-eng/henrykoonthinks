import FloatingQuotes from '@/components/FloatingQuotes';
import quotes from '../../../content/quotes.json';

export default function QuotesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-16 text-center overflow-hidden">
        <img
          src="/images/home-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm" />
        <div className="relative z-10">
          <h1
            className="text-4xl sm:text-5xl font-bold text-stone-100 uppercase tracking-wider mb-4"
            style={{ letterSpacing: '0.1em' }}
          >
            Quotes
          </h1>
          <div className="w-16 h-0.5 bg-brand-400 mx-auto mb-4" />
          <p className="text-stone-300 text-lg max-w-xl mx-auto px-6">
            Some gems I&apos;ve found lately
          </p>
        </div>
      </section>

      {/* Quotes Grid */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-stone-50 min-h-screen">
        <FloatingQuotes quotes={quotes} />
      </section>
    </div>
  );
}
