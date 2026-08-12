// Static audit of dist/. Runs without a browser or a dependency, so it can gate a deploy.
// Checks: internal link integrity, asset references, heading order, form labelling,
// image alt text, duplicate ids, and required document metadata.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), 'dist');

// Emitted URLs carry BASE_PATH when the site is built for a project subpath; strip it
// so route checks compare like with like.
const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const stripBase = (url) => (BASE_PATH && url.startsWith(`${BASE_PATH}/`) ? url.slice(BASE_PATH.length) : url);

// When consent is switched on it must reach every page, and the stub must run before
// anything else in <head>. A page that misses it would set cookies without asking.
const CONSENT_ID = process.env.ONETRUST_DOMAIN_ID ?? '';
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/$/, '');
const expectedCanonical = (route) => `${SITE_URL}${BASE_PATH}${route === '/' ? '/' : route}`;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
  );
  return files.flat();
}

const routeOf = (file) => {
  const rel = relative(dist, file).replace(/index\.html$/, '').replace(/\/$/, '');
  return rel === '' ? '/' : `/${rel}`;
};

const problems = [];
const indexable = new Map();
const fail = (page, rule, detail) => problems.push({ page, rule, detail });

const files = await walk(dist);
// 404.html is a byte-identical fallback copy of /404 that static hosts serve for unmatched
// paths. Auditing it as its own route would flag its canonical as wrong, which it is not.
const pages = files.filter((f) => f.endsWith('.html') && !f.endsWith(`${sep}404.html`));
const routes = new Set(pages.map(routeOf));
const assets = new Set(files.map((f) => `/${relative(dist, f)}`));

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const route = routeOf(file);

  // document metadata
  if (!/<html lang="[a-z-]+"/.test(html)) fail(route, 'lang', 'missing <html lang>');
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(route, 'title', 'missing or short <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(route, 'description', 'missing meta description');

  if (CONSENT_ID) {
    const head = html.slice(0, html.indexOf('</head>'));
    if (!head.includes(`data-domain-script="${CONSENT_ID}"`)) fail(route, 'consent', 'consent stub missing from <head>');
    else if (head.indexOf('cookielaw.org') > head.indexOf('<title>')) fail(route, 'consent', 'consent stub loads after <title>');
    if (!html.includes('ot-sdk-show-settings')) fail(route, 'consent', 'no cookie preferences control');
  }

  // --- SEO: metadata that must be on every page ---
  const meta = (name) => html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1];

  const titleText = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  if (titleText.length > 65) fail(route, 'title-length', `${titleText.length} chars, aim for <= 65`);
  const desc = meta('description') ?? '';
  const indexablePage = !html.includes('content="noindex');
  if (!desc) fail(route, 'description', 'missing meta description');
  else if (indexablePage && (desc.length < 50 || desc.length > 165)) {
    fail(route, 'description-length', `${desc.length} chars, aim for 50-165`);
  }

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) fail(route, 'canonical', 'missing canonical link');
  else if (SITE_URL && canonical !== expectedCanonical(route)) {
    fail(route, 'canonical', `points at ${canonical}, expected ${expectedCanonical(route)}`);
  }

  for (const tag of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'twitter:card', 'twitter:image']) {
    if (!meta(tag)) fail(route, 'social-meta', `missing ${tag}`);
  }

  const robotsMeta = meta('robots');
  if (!robotsMeta) fail(route, 'robots-meta', 'missing robots meta');
  const isNoindex = robotsMeta?.includes('noindex');

  // --- SEO: structured data ---
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!ld) {
    if (!isNoindex) fail(route, 'structured-data', 'no JSON-LD on an indexable page');
  } else {
    try {
      const parsed = JSON.parse(ld);
      if (!parsed['@context']) fail(route, 'structured-data', 'JSON-LD without @context');
      if (!Array.isArray(parsed['@graph']) || !parsed['@graph'].length) {
        fail(route, 'structured-data', 'JSON-LD @graph is empty');
      }
      for (const node of parsed['@graph'] ?? []) {
        if (!node['@type']) fail(route, 'structured-data', 'graph node without @type');
      }
    } catch (err) {
      fail(route, 'structured-data', `JSON-LD does not parse: ${err.message}`);
    }
  }

  indexable.set(route, !isNoindex);

  // links and assets
  for (const [, raw] of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const url = stripBase(raw);
    if (/\.(css|js|svg|png|ico|woff2?|xml|txt)$/.test(url)) {
      if (!assets.has(url)) fail(route, 'asset', `missing ${url}`);
    } else if (!routes.has(url)) {
      fail(route, 'link', `dead internal link ${url}`);
    }
  }

  // heading order
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s !== 1) fail(route, 'h1', `${h1s} <h1> elements, expected exactly 1`);
  levels.forEach((level, i) => {
    if (i && level - levels[i - 1] > 1) fail(route, 'heading-order', `h${levels[i - 1]} followed by h${level}`);
  });

  // form controls need a label, an aria-label, or an aria-labelledby
  for (const [tag] of html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)) {
    if (/type="hidden"/.test(tag)) continue;
    const id = tag.match(/id="([^"]+)"/)?.[1];
    const labelled = (id && html.includes(`for="${id}"`)) || /aria-label(ledby)?=/.test(tag);
    if (!labelled) fail(route, 'label', `unlabelled control ${id ?? tag.slice(0, 40)}`);
  }

  // images need an alt attribute, even an empty one
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) fail(route, 'alt', `img without alt: ${tag.slice(0, 60)}`);
  }

  // duplicate ids break every aria reference that points at them
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(route, 'duplicate-id', [...new Set(dupes)].join(', '));
}

// --- SEO: site-level artefacts ---
// sitemap.xml and feed.xml need absolute URLs, so they are only produced when SITE_URL is
// known. A build without it is a local preview, not a deployable one.
const required = ['robots.txt', 'og-image.png', 'llms.txt'];
if (SITE_URL) required.push('sitemap.xml', 'feed.xml');
for (const file of required) {
  if (!assets.has(`/${file}`)) fail('(site)', 'seo-artefact', `missing ${file}`);
}

if (assets.has('/sitemap.xml')) {
  const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  for (const [route, isIndexable] of indexable) {
    const listed = sitemap.includes(`${BASE_PATH}${route === '/' ? '/' : route}<`);
    if (isIndexable && !listed) fail(route, 'sitemap', 'indexable page missing from sitemap');
    if (!isIndexable && listed) fail(route, 'sitemap', 'noindex page listed in sitemap');
  }
}

const byRule = problems.reduce((acc, p) => ({ ...acc, [p.rule]: (acc[p.rule] ?? 0) + 1 }), {});
console.log(`audited ${pages.length} pages, ${assets.size} assets`);

if (!problems.length) {
  console.log('no problems found');
  process.exit(0);
}

console.log(`\n${problems.length} problem(s):`, byRule);
for (const p of problems) console.log(`  ${p.page.padEnd(34)} ${p.rule.padEnd(14)} ${p.detail}`);
process.exit(1);
