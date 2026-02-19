'use client';

import { useEffect, useRef } from 'react';

export default function DisqusComments({ postSlug, postTitle }: { postSlug: string; postTitle: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Disqus configuration
    const disqusConfig = {
      url: `https://henrythinks.com/posts/${postSlug}`,
      identifier: postSlug,
      title: postTitle,
    };

    // @ts-ignore
    window.disqus_config = function () {
      // @ts-ignore
      this.page.url = disqusConfig.url;
      // @ts-ignore
      this.page.identifier = disqusConfig.identifier;
      // @ts-ignore
      this.page.title = disqusConfig.title;
    };

    // Load Disqus script
    const script = document.createElement('script');
    script.src = 'https://henrykoonthinks.disqus.com/embed.js';
    script.setAttribute('data-timestamp', String(+new Date()));
    script.async = true;

    ref.current.appendChild(script);

    return () => {
      // Cleanup not needed as Disqus manages itself
    };
  }, [postSlug, postTitle]);

  return (
    <section className="mt-12 pt-8 border-t border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-6 uppercase tracking-wider">Comments</h2>
      <div ref={ref} id="disqus_thread" />
    </section>
  );
}
