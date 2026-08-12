// Static site build. No dependencies: reads src/pages/*, renders HTML, writes dist/.
//
// BASE_PATH lets the same output work at a domain root and under a project subpath
// (GitHub Pages serves this repo at /demofiles2/). Absolute URLs in the emitted HTML are
// rewritten once, here, rather than threading a prefix through every call site.
// CSS references its own assets relatively, so it needs no rewriting.
import { readdir, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderOgImage } from './tools/og-image.mjs';
import { posts } from './src/data/blog.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const pagesDir = join(root, 'src', 'pages');

const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/$/, '');

/** Prefix root-relative href/src values, leaving external, anchor and mailto links alone. */
const applyBasePath = (html) =>
  BASE_PATH ? html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE_PATH}/`) : html;

const canonicalFor = (path) =>
  SITE_URL ? `${SITE_URL}${BASE_PATH}${path === '/' ? '/' : `/${path}`}` : '';

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(join(root, 'public'), dist, { recursive: true });

  const files = (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs'));
  const modules = await Promise.all(files.map((f) => import(join(pagesDir, f))));
  const pages = modules.flatMap((m) => m.default);

  for (const page of pages) {
    const html = applyBasePath(page.render());
    const outDir = page.path === '/' ? dist : join(dist, page.path);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), html, 'utf8');

    // Static hosts (GitHub Pages, Netlify, S3) serve /404.html for unmatched paths.
    if (page.path === '404') await writeFile(join(dist, '404.html'), html, 'utf8');

    console.log(`  ${page.path.padEnd(38)} ${page.title}`);
  }

  await writeFile(join(dist, 'og-image.png'), renderOgImage());
  await writeSitemap(pages);
  await writeRobots();
  await writeFeed();
  await writeLlmsTxt(pages);

  console.log(`\nbuilt ${pages.length} pages into dist/${BASE_PATH ? ` (base ${BASE_PATH})` : ''}`);
}

/**
 * Every crawler is welcome, including the AI ones, which are named explicitly: several
 * default to "no" when a site is silent, and a blanket allow does not always reach them.
 */
async function writeRobots() {
  const aiAgents = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot',
    'Applebot-Extended',
    'CCBot',
    'Amazonbot',
    'Bytespider',
    'meta-externalagent',
    'DuckAssistBot',
    'cohere-ai',
    'YouBot',
  ];
  const lines = [
    '# Everything here is public and may be crawled, indexed, and cited.',
    'User-agent: *',
    'Allow: /',
    '',
    ...aiAgents.flatMap((agent) => [`User-agent: ${agent}`, 'Allow: /', '']),
  ];
  if (SITE_URL) lines.push(`Sitemap: ${SITE_URL}${BASE_PATH}/sitemap.xml`);
  await writeFile(join(dist, 'robots.txt'), `${lines.join('\n')}\n`, 'utf8');
}

/** Atom feed for the blog: a second, machine-readable route into the writing. */
async function writeFeed() {
  if (!SITE_URL) return;
  const home = `${SITE_URL}${BASE_PATH}/`;
  const entries = posts
    .map(
      (post) => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${home}blog/${post.slug}" />
    <id>${home}blog/${post.slug}</id>
    <updated>${post.date}T00:00:00Z</updated>
    <summary>${escapeXml(post.excerpt)}</summary>
  </entry>`
    )
    .join('\n');
  await writeFile(
    join(dist, 'feed.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Boz blog</title>
  <link href="${home}blog" />
  <link rel="self" href="${home}feed.xml" />
  <id>${home}</id>
  <updated>${posts[0].date}T00:00:00Z</updated>
${entries}
</feed>
`,
    'utf8'
  );
}

/** llms.txt: a plain-text map of the site for language-model crawlers. */
async function writeLlmsTxt(pages) {
  const listed = pages.filter((p) => !p.noindex && p.path !== '404');
  const lines = [
    '# Boz',
    '',
    '> A voice-first reading tutor for students aged 9 to 18, taught one book at a time.',
    '> Demonstration build: the company is fictional, the content is drawn from the public-domain',
    '> works of Charles Dickens, and no personal data is collected.',
    '',
    '## Pages',
    '',
    ...listed.map((p) => `- [${p.title}](${SITE_URL}${BASE_PATH}${p.path === '/' ? '/' : `/${p.path}`}): ${p.description}`),
    '',
    '## Notes',
    '',
    '- All content may be crawled, indexed and cited.',
    '- The waitlist form stores its entry in the visitor browser only; there is no backend.',
  ];
  await writeFile(join(dist, 'llms.txt'), `${lines.join('\n')}\n`, 'utf8');
}

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

async function writeSitemap(pages) {
  if (!SITE_URL) return;
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter((p) => !p.noindex && p.path !== '404')
    .map((p) => `  <url><loc>${canonicalFor(p.path)}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  await writeFile(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8'
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
