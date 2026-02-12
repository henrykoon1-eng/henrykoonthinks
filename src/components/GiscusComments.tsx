'use client';

import { useEffect, useRef } from 'react';

export default function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'henrykoon1-eng/henrykoonthinks');
    script.setAttribute('data-repo-id', 'R_kgDORObEUQ');
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDORObEUc4C2T-w');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'dark_protanopia');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    ref.current.appendChild(script);
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-6 uppercase tracking-wider">Comments</h2>
      <div ref={ref} />
    </section>
  );
}
