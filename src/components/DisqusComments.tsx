'use client';

import { useEffect } from 'react';

interface DisqusCommentsProps {
  postSlug: string;
  postTitle: string;
}

export default function DisqusComments({ postSlug, postTitle }: DisqusCommentsProps) {
  useEffect(() => {
    // Disqus configuration
    // @ts-ignore
    window.disqus_config = function () {
      // @ts-ignore
      this.page.url = `https://henrythinks.com/posts/${postSlug}`;
      // @ts-ignore
      this.page.identifier = postSlug;
      // @ts-ignore
      this.page.title = postTitle;
    };

    // Load Disqus script
    (function() {
      var d = document, s = d.createElement('script');
      // @ts-ignore
      s.src = 'https://henrythinks-com.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
      (d.head || d.body).appendChild(s);
    })();
  }, [postSlug, postTitle]);

  return (
    <section className="mt-12 pt-8 border-t border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-6 uppercase tracking-wider">Comments</h2>
      <div id="disqus_thread" />
      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
      </noscript>
    </section>
  );
}
