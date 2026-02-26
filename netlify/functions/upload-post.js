const mammoth = require('mammoth');
const busboy = require('busboy');

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileBuffer = null;
    let fileName = '';

    const contentType =
      event.headers['content-type'] || event.headers['Content-Type'];

    const bb = busboy({ headers: { 'content-type': contentType } });

    bb.on('file', (fieldname, file, info) => {
      fileName = info.filename;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    bb.on('finish', () => {
      resolve({ fields, fileBuffer, fileName });
    });

    bb.on('error', reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body);

    bb.end(body);
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

exports.handler = async (event) => {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Simple password check
  const authHeader = event.headers['authorization'] || '';
  const expectedPassword = process.env.UPLOAD_PASSWORD;
  if (!expectedPassword || authHeader !== `Bearer ${expectedPassword}`) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const { fields, fileBuffer, fileName } = await parseMultipart(event);

    if (!fileBuffer) {
      return { statusCode: 400, body: 'No file uploaded' };
    }

    const title = fields.title || fileName.replace(/\.docx?$/i, '');
    const category = fields.category || 'life';
    const excerpt = fields.excerpt || '';
    const coverImage = fields.coverImage || '';
    const date = fields.date || new Date().toISOString().split('T')[0];

    // Convert .docx to markdown-ish HTML, then to clean text
    const result = await mammoth.convertToMarkdown(
      { buffer: fileBuffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => # ",
          "p[style-name='Heading 2'] => ## ",
          "p[style-name='Heading 3'] => ### ",
        ],
      }
    );

    let markdown = result.value;

    // Build frontmatter
    const slug = slugify(title);
    const frontmatter = [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: "${date}"`,
      `category: "${category}"`,
      `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    ];
    if (coverImage) {
      frontmatter.push(`coverImage: "${coverImage}"`);
    }
    frontmatter.push('---');

    const fileContent = frontmatter.join('\n') + '\n\n' + markdown;

    // Commit to GitHub
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'henrykoon1-eng/henrykoonthinks';
    const filePath = `content/posts/${slug}.md`;

    // Check if file already exists
    const checkRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const body = {
      message: `Add post: ${title}`,
      content: Buffer.from(fileContent).toString('base64'),
      branch: 'main',
    };

    // If file exists, include the sha to update it
    if (checkRes.ok) {
      const existing = await checkRes.json();
      body.sha = existing.sha;
      body.message = `Update post: ${title}`;
    }

    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.text();
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'GitHub commit failed', details: err }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        slug,
        message: `Post "${title}" published! Netlify will redeploy in ~1 minute.`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
