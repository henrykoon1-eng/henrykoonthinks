'use client';

import { useState } from 'react';

interface Comment {
  name: string;
  comment: string;
  date: string;
}

// This would come from a data file or API in production
// For now, we'll just show the submission form
export default function AnonymousComments({ postSlug }: { postSlug: string }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      setStatus('success');
      setName('');
      setComment('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-6 uppercase tracking-wider">Comments</h2>
      
      {/* Submission Form */}
      <form
        name={`comments-${postSlug}`}
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="bg-stone-50 rounded-lg p-6 mb-8"
      >
        <input type="hidden" name="form-name" value={`comments-${postSlug}`} />
        <input type="hidden" name="post-slug" value={postSlug} />
        <div hidden>
          <input name="bot-field" />
        </div>

        <div className="mb-4">
          <label htmlFor="comment-name" className="block text-sm font-medium text-stone-700 mb-1">
            Name (any name you want)
          </label>
          <input
            id="comment-name"
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="comment-text" className="block text-sm font-medium text-stone-700 mb-1">
            Comment
          </label>
          <textarea
            id="comment-text"
            name="comment"
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-brand-500 text-sm resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {status === 'submitting' ? 'Submitting...' : 'Post Comment'}
        </button>

        {status === 'success' && (
          <p className="mt-3 text-sm text-green-600">
            Thanks! Your comment has been submitted for approval.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm text-red-600">
            Something went wrong. Please try again.
          </p>
        )}
      </form>

      <p className="text-sm text-stone-500 italic">
        Comments are moderated before appearing.
      </p>
    </section>
  );
}
