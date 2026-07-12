'use client';

import { useEffect, useRef } from 'react';

interface CommentsProps {
  substackUrl?: string;
}

/**
 * Ad-free comments.
 *
 * This replaces Disqus, whose free tier injects third-party advertisements into
 * the comment box. It renders Giscus (comments backed by GitHub Discussions —
 * free, no ads, no tracking) when configured below, and otherwise falls back to
 * a simple "discuss on Substack" link so there are never ads on the page.
 *
 * To turn on Giscus (one-time, ~3 minutes):
 *   1. Enable Discussions on the repo: GitHub repo -> Settings -> General ->
 *      Features -> check "Discussions".
 *   2. Install the Giscus app: https://github.com/apps/giscus -> Install ->
 *      pick the henrykoonthinks repo.
 *   3. Go to https://giscus.app, enter the repo (henrykoon1-eng/henrykoonthinks),
 *      pick a Discussion category (e.g. "Announcements" or "General"), and copy
 *      the four values it generates into GISCUS below. Then set enabled: true.
 */
const GISCUS = {
  enabled: false,
  repo: 'henrykoon1-eng/henrykoonthinks',
  repoId: '',        // from giscus.app
  category: 'General',
  categoryId: '',     // from giscus.app
};

export default function Comments({ substackUrl }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GISCUS.enabled || !GISCUS.repoId || !GISCUS.categoryId) return;
    const el = containerRef.current;
    if (!el || el.querySelector('script')) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', GISCUS.repo);
    script.setAttribute('data-repo-id', GISCUS.repoId);
    script.setAttribute('data-category', GISCUS.category);
    script.setAttribute('data-category-id', GISCUS.categoryId);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');
    el.appendChild(script);
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-6 uppercase tracking-wider">
        Comments
      </h2>

      {GISCUS.enabled && GISCUS.repoId && GISCUS.categoryId ? (
        <div ref={containerRef} />
      ) : (
        <div className="bg-stone-50 border border-stone-200 px-6 py-8 text-center">
          <p className="text-stone-600 text-sm mb-5" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
            Join the conversation over on Substack.
          </p>
          <a
            href={`${substackUrl || 'https://blog.henrythinks.com'}${substackUrl ? '#comments' : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 border border-stone-300 text-stone-700 text-sm font-medium tracking-wider uppercase hover:bg-stone-100 transition-colors"
            style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            Leave a comment &rarr;
          </a>
        </div>
      )}
    </section>
  );
}
