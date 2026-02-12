# Henry Koon Thinks

A personal blog built with Next.js, Tailwind CSS, and Markdown.

## How to Add a New Blog Post

1. Create a new `.md` file in the `content/posts/` folder
2. Add frontmatter at the top of the file:

```markdown
---
title: "Your Post Title"
date: "2026-02-11"
category: "life"
excerpt: "A short description of your post."
coverImage: "/images/optional-cover.jpg"
---

Your post content goes here. You can use **bold**, *italic*, 
## headings, lists, links, and more.
```

3. Available categories: `life`, `faith`, `essays`, `the-outdoors`, `poetry`
4. Rebuild and redeploy the site (see Deployment below)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
```

This generates a static site in the `out/` folder.

## Deployment to Netlify

This site is configured for static export and can be deployed to Netlify:

1. Push your code to a GitHub repository
2. Connect the repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `out`

### Connecting Your DreamHost Domain

After deploying to Netlify:

1. In Netlify, go to **Domain Settings** > **Add custom domain**
2. Enter `henrykoonthinks.com`
3. Netlify will give you DNS records (usually a CNAME or A record)
4. Log into DreamHost panel > **Manage Domains**
5. Set DNS for `henrykoonthinks.com` to point to Netlify:
   - Option A: Change nameservers to Netlify's nameservers
   - Option B: Add a CNAME record pointing to your Netlify site URL
6. Wait for DNS propagation (can take up to 48 hours)
7. Enable HTTPS in Netlify domain settings (free SSL)

## Project Structure

```
content/
  posts/          ← Your blog posts (Markdown files)
src/
  app/            ← Pages and layouts
  components/     ← Reusable UI components
  lib/            ← Utilities (Markdown parser, etc.)
public/
  images/         ← Images for your posts
```
