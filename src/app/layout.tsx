import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Henry Koon Thinks',
  description: 'Essays on life, faith, the outdoors, poetry, and the things worth thinking about.',
  metadataBase: new URL('https://henrykoonthinks.com'),
  icons: {
    // Raster icons so the logo shows in Google results and browser tabs
    // (Google does not use SVG favicons for the search-result icon).
    icon: [
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': 'https://henrykoonthinks.com/rss.xml',
    },
  },
  openGraph: {
    siteName: 'Henry Koon Thinks',
    description: 'Essays on life, faith, the outdoors, poetry, and the things worth thinking about.',
    type: 'website',
    locale: 'en_US',
    url: 'https://henrykoonthinks.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Henry Koon Thinks' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

// Organization structured data — gives Google the site name + logo it uses
// for the entity/knowledge panel and the icon beside search results.
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Henry Koon Thinks',
  url: 'https://henrykoonthinks.com',
  logo: 'https://henrykoonthinks.com/icon.png',
  sameAs: ['https://blog.henrythinks.com'],
};

const navLinks: { href: string; label: string; italic?: boolean }[] = [
  { href: '/category/the-outdoors', label: 'The Outdoors' },
  { href: '/category/life', label: 'Life' },
  { href: '/category/faith', label: 'Faith' },
  { href: '/category/essays', label: 'Essays' },
  { href: '/category/poetry', label: 'Poetry' },
  { href: '/category/reviews', label: 'Reviews' },
  { href: '/quotes', label: 'Quotes', italic: true },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script src="https://identity.netlify.com/v1/netlify-identity-widget.js" strategy="afterInteractive" />
        <Script id="netlify-identity-redirect" strategy="afterInteractive">{`
          if (window.netlifyIdentity) {
            window.netlifyIdentity.on("init", function(user) {
              if (!user) {
                window.netlifyIdentity.on("login", function() {
                  document.location.href = "/admin/";
                });
              }
            });
          }
        `}</Script>
        {/* Header */}
        <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-50">
          <div className="px-4 sm:px-8 lg:px-16">
            <div className="flex flex-col sm:flex-row items-center justify-between py-4">
              <Link href="/" className="group mb-3 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight group-hover:text-brand-300 transition-colors uppercase" style={{ letterSpacing: '0.15em' }}>
                  Henry Koon Thinks
                </h1>
              </Link>
              <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
                {navLinks.map((link) =>
                  link.href.startsWith('http') ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm font-medium text-stone-400 hover:text-stone-100 uppercase tracking-wider transition-all"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 text-sm font-medium text-stone-400 hover:text-stone-100 uppercase tracking-wider transition-all${link.italic ? ' italic' : ''}`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-stone-900 text-stone-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-stone-200 text-lg mb-3 uppercase tracking-widest">Henry Koon Thinks</h3>
                <p className="text-sm leading-relaxed">
                  Thoughts on life, faith, the great outdoors, and everything in between.
                </p>
              </div>
              <div>
                <h4 className="text-stone-200 mb-3 uppercase tracking-wider text-sm">Categories</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/category/life" className="hover:text-stone-200 transition-colors">Life</Link></li>
                  <li><Link href="/category/faith" className="hover:text-stone-200 transition-colors">Faith</Link></li>
                  <li><Link href="/category/essays" className="hover:text-stone-200 transition-colors">Essays</Link></li>
                  <li><Link href="/category/the-outdoors" className="hover:text-stone-200 transition-colors">The Outdoors</Link></li>
                  <li><Link href="/category/poetry" className="hover:text-stone-200 transition-colors">Poetry</Link></li>
                  <li><Link href="/category/reviews" className="hover:text-stone-200 transition-colors">Reviews</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-stone-200 mb-3 uppercase tracking-wider text-sm">Connect</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="https://blog.henrythinks.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-stone-400 hover:text-[#FF6719] transition-colors group"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 fill-stone-400 group-hover:fill-[#FF6719] transition-colors flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                      </svg>
                      Read on Substack
                    </a>
                  </li>
                  <li><Link href="/about" className="hover:text-stone-200 transition-colors">About</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-stone-800 mt-8 pt-6 text-center text-sm text-stone-600">
              &copy; {new Date().getFullYear()} Henry Koon Thinks. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
