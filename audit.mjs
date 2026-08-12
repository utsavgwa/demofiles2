// Static audit of dist/. Runs without a browser or a dependency, so it can gate a deploy.
// Checks: internal link integrity, asset references, heading order, form labelling,
// image alt text, duplicate ids, and required document metadata.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), 'dist');

// Emitted URLs carry BASE_PATH when the site is built for a project subpath; strip it
// so route checks compare like with like.
const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const stripBase = (url) => (BASE_PATH && url.startsWith(`${BASE_PATH}/`) ? url.slice(BASE_PATH.length) : url);

// When consent is switched on it must reach every page, and the stub must run before
// anything else in <head>. A page that misses it would set cookies without asking.
const CONSENT_ID = process.env.ONETRUST_DOMAIN_ID ?? '';

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
const fail = (page, rule, detail) => problems.push({ page, rule, detail });

const files = await walk(dist);
const pages = files.filter((f) => f.endsWith('.html'));
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

  // links and assets
  for (const [, raw] of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const url = stripBase(raw);
    if (/\.(css|js|svg|png|ico|woff2?)$/.test(url)) {
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

const byRule = problems.reduce((acc, p) => ({ ...acc, [p.rule]: (acc[p.rule] ?? 0) + 1 }), {});
console.log(`audited ${pages.length} pages, ${assets.size} assets`);

if (!problems.length) {
  console.log('no problems found');
  process.exit(0);
}

console.log(`\n${problems.length} problem(s):`, byRule);
for (const p of problems) console.log(`  ${p.page.padEnd(34)} ${p.rule.padEnd(14)} ${p.detail}`);
process.exit(1);
