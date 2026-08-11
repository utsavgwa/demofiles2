// Static site build. No dependencies: reads src/pages/*, renders HTML, writes dist/.
//
// BASE_PATH lets the same output work at a domain root and under a project subpath
// (GitHub Pages serves this repo at /demofiles2/). Absolute URLs in the emitted HTML are
// rewritten once, here, rather than threading a prefix through every call site.
// CSS references its own assets relatively, so it needs no rewriting.
import { readdir, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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

const withCanonical = (html, path) => {
  const url = canonicalFor(path);
  return url ? html.replace('</head>', `<link rel="canonical" href="${url}" />\n</head>`) : html;
};

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(join(root, 'public'), dist, { recursive: true });

  const files = (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs'));
  const modules = await Promise.all(files.map((f) => import(join(pagesDir, f))));
  const pages = modules.flatMap((m) => m.default);

  for (const page of pages) {
    const html = withCanonical(applyBasePath(page.render()), page.path);
    const outDir = page.path === '/' ? dist : join(dist, page.path);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), html, 'utf8');

    // Static hosts (GitHub Pages, Netlify, S3) serve /404.html for unmatched paths.
    if (page.path === '404') await writeFile(join(dist, '404.html'), html, 'utf8');

    console.log(`  ${page.path.padEnd(38)} ${page.title}`);
  }

  await writeSitemap(pages);
  await writeFile(
    join(dist, 'robots.txt'),
    ['User-agent: *', 'Allow: /', SITE_URL ? `Sitemap: ${SITE_URL}${BASE_PATH}/sitemap.xml` : ''].filter(Boolean).join('\n') + '\n',
    'utf8'
  );

  console.log(`\nbuilt ${pages.length} pages into dist/${BASE_PATH ? ` (base ${BASE_PATH})` : ''}`);
}

async function writeSitemap(pages) {
  if (!SITE_URL) return;
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter((p) => p.path !== '404')
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
