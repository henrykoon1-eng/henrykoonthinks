'use client';

import { useEffect } from 'react';

export default function PostLinkCards() {
  useEffect(() => {
    // Find all links inside .prose that point to internal posts
    const proseEl = document.querySelector('.prose');
    if (!proseEl) return;

    const links = proseEl.querySelectorAll('a[href*="/posts/"]');
    links.forEach((link) => {
      const anchor = link as HTMLAnchorElement;
      // Skip if already styled or if it's inline (part of a sentence)
      if (anchor.dataset.styled) return;
      const parent = anchor.parentElement;
      if (!parent) return;

      // Only style links that are the sole content of their paragraph
      // (i.e. a standalone link, not "read my thoughts on [this essay] here")
      const isStandalone =
        parent.tagName === 'P' &&
        parent.childNodes.length === 1 &&
        parent.firstChild === anchor;

      if (!isStandalone) return;

      // Get the link text (title) 
      const title = anchor.textContent || '';
      const href = anchor.getAttribute('href') || '';

      // Create styled card
      const card = document.createElement('a');
      card.href = href;
      card.dataset.styled = 'true';
      card.style.cssText = `
        display: block;
        padding: 16px 20px;
        margin: 24px 0;
        border: 1px solid #d6d3d1;
        border-left: 3px solid #78716c;
        text-decoration: none;
        transition: all 0.2s;
        font-family: 'Cormorant Garamond', Georgia, serif;
      `;
      card.innerHTML = `
        <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #a8a29e; display: block; margin-bottom: 4px;">Read also</span>
        <span style="font-size: 1.25rem; font-weight: 600; color: #1c1917;">${title}</span>
      `;
      card.addEventListener('mouseenter', () => {
        card.style.borderLeftColor = '#44403c';
        card.style.background = '#fafaf9';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderLeftColor = '#78716c';
        card.style.background = 'transparent';
      });

      // Replace the parent paragraph with the card
      parent.replaceWith(card);
    });
  }, []);

  return null;
}
