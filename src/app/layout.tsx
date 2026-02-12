import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import SubscribeForm from '@/components/SubscribeForm';

export const metadata: Metadata = {
  title: 'Henry Koon Thinks',
  description: 'A blog about life, faith, essays, the outdoors, and poetry.',
};

const navLinks = [
  { href: '/category/life', label: 'Life' },
  { href: '/category/faith', label: 'Faith' },
  { href: '/category/essays', label: 'Essays' },
  { href: '/category/the-outdoors', label: 'The Outdoors' },
  { href: '/category/poetry', label: 'Poetry' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
      </head>
      <body className="min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.netlifyIdentity) {
            window.netlifyIdentity.on("init", function(user) {
              if (!user) {
                window.netlifyIdentity.on("login", function() {
                  document.location.href = "/admin/";
                });
              }
            });
          }
        `}} />
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 text-sm font-medium text-stone-400 hover:text-stone-100 uppercase tracking-wider transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full">
          {children}
        </main>

        {/* Subscribe */}
        <SubscribeForm />

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
                </ul>
              </div>
              <div>
                <h4 className="text-stone-200 mb-3 uppercase tracking-wider text-sm">About</h4>
                <p className="text-sm leading-relaxed">
                  Welcome to my corner of the internet. Here I share my thoughts, stories, and reflections.
                </p>
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
