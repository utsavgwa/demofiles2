// Shared HTML primitives. Mirrors the component vocabulary of the reference site
// (Section / Heading / Text / Eyebrow / Button / Card / TornEdge) without a framework.
import { site, consent } from '../data/site.mjs';

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ---------- text primitives ---------- */

export const heading = (level, body, { variant = `h${level}`, align = 'start', className = '', id = '' } = {}) =>
  `<h${level} class="${cx('heading', variant, align, className)}"${id ? ` id="${esc(id)}"` : ''}>${body}</h${level}>`;

export const eyebrow = (body, { align = 'start', className = '' } = {}) =>
  `<p class="${cx('eyebrow', align, className)}">${body}</p>`;

export const preheading = (body, { align = 'center' } = {}) =>
  `<p class="${cx('heading', 'preheading', align)}">${body}</p>`;

export const text = (body, { size = 'body', tone = 'default', align = 'start', className = '' } = {}) =>
  `<p class="${cx('text', size, tone, align, className)}">${body}</p>`;

/* ---------- interactive primitives ---------- */

export const button = (label, href, { variant = 'gradient', size = 'md' } = {}) =>
  `<a class="${cx('button', variant, size)}" href="${esc(href)}">${esc(label)}</a>`;

export const ctaLink = (label, href) =>
  `<a class="cta-link" href="${esc(href)}">${esc(label)}<span class="cta-arrow" aria-hidden="true">&rarr;</span></a>`;

/* ---------- layout primitives ---------- */

const tornEdge = (position) =>
  `<div class="torn-edge ${position}" aria-hidden="true"><div class="torn-surface"></div></div>`;

/**
 * @param {string} content inner HTML
 * @param {object} [opts]
 * @param {'default'|'graph'|'paper'|'accent'} [opts.background]
 * @param {'sm'|'md'|'lg'|'xl'} [opts.spacing]
 * @param {'narrow'|'default'|'wide'|'none'} [opts.container]
 * @param {boolean} [opts.torn] adds top+bottom torn paper edges (paper/accent sections)
 */
export const section = (
  content,
  { background = 'default', spacing = 'lg', container = 'default', torn = false, className = '', id = '' } = {}
) => {
  const inner = container === 'none' ? content : `<div class="container ${container}">${content}</div>`;
  return `<section class="${cx('section', background, `spacing-${spacing}`, className)}"${id ? ` id="${id}"` : ''}>
${torn ? tornEdge('top') : ''}${inner}${torn ? tornEdge('bottom') : ''}
</section>`;
};

export const card = (content, { className = '' } = {}) =>
  `<div class="${cx('card', className)}">${content}</div>`;

/* ---------- chrome ---------- */

const navLink = (item) => `<a class="nav-link" href="${esc(item.href)}">${esc(item.label)}</a>`;

const header = () => `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <nav class="nav-left" aria-label="Primary">
    ${site.nav.left.map(navLink).join('\n    ')}
  </nav>
  <a class="logo-link" href="/" aria-label="${esc(site.name)} home">
    <img class="logo-mark" src="/brand/inkwell.svg" alt="" width="40" height="40" />
  </a>
  <nav class="nav-right" aria-label="Secondary">
    ${site.nav.right.map(navLink).join('\n    ')}
    <a class="button gradient sm" href="${esc(site.cta.primary.href)}">${esc(site.cta.primary.label)}</a>
  </nav>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>
</header>
<div class="mobile-nav" id="mobile-nav" hidden>
  ${[...site.nav.left, ...site.nav.right].map(navLink).join('\n  ')}
  <a class="nav-link" href="${esc(site.cta.secondary.href)}">${esc(site.cta.secondary.label)}</a>
  <a class="button gradient md" href="${esc(site.cta.primary.href)}">${esc(site.cta.primary.label)}</a>
</div>`;

const footerColumn = (col) => `
    <div class="footer-column">
      ${eyebrow(esc(col.title))}
      ${col.links.map((l) => `<a class="footer-link" href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n      ')}
    </div>`;

const footer = () => `
<footer class="site-footer">
  ${tornEdge('top')}
  <div class="container wide footer-body">
    <button class="footer-inkwell" type="button" aria-label="Shake the inkwell">
      <img src="/brand/inkwell.svg" alt="" width="60" height="60" />
    </button>
    <div class="footer-inner">
      ${site.footer.columns.map(footerColumn).join('')}
      <div class="footer-column legal">
        ${eyebrow('Legal')}
        ${site.footer.legal.map((l) => `<a class="footer-link" href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n        ')}
        ${consentPreferencesButton()}
        <p class="text small muted start copyright">&copy; ${site.year} ${esc(site.legalEntity)}</p>
      </div>
    </div>
    <div class="footer-wordmark" aria-hidden="true">${esc(site.name)}</div>
  </div>
</footer>`;


/* ---------- form primitives ---------- */

/**
 * A labelled control with its hint and error region wired up for screen readers.
 * `aria-describedby` always points at both ids; the error node stays empty until
 * validation fills it, which keeps the wiring static and the JS simple.
 */
export const field = ({
  id,
  label,
  type = 'text',
  name = id,
  required = false,
  autocomplete = 'off',
  placeholder = '',
  hint = '',
  options,
}) => {
  const control = options
    ? `<select id="${esc(id)}" name="${esc(name)}" ${required ? 'required aria-required="true"' : ''}
         aria-describedby="${esc(id)}-hint ${esc(id)}-error">
         ${options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('\n         ')}
       </select>`
    : `<input id="${esc(id)}" name="${esc(name)}" type="${esc(type)}"
         ${required ? 'required aria-required="true"' : ''}
         autocomplete="${esc(autocomplete)}"
         ${placeholder ? `placeholder="${esc(placeholder)}"` : ''}
         aria-describedby="${esc(id)}-hint ${esc(id)}-error" />`;

  return `<div class="field">
    <label class="field-label" for="${esc(id)}">${esc(label)}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    ${control}
    <p class="field-hint" id="${esc(id)}-hint">${esc(hint)}</p>
    <p class="field-error" id="${esc(id)}-error" role="alert"></p>
  </div>`;
};

/* ---------- consent ---------- */

/**
 * OneTrust's stub has to run in <head>, before anything that could set a cookie, so it
 * cannot go through page({ scripts }) — those are deferred and appended to <body>.
 */
const consentScript = () =>
  consent.enabled
    ? `<script src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js" type="text/javascript" charset="UTF-8" data-domain-script="${esc(consent.domainScriptId)}"></script>
<script type="text/javascript">function OptanonWrapper() {}</script>`
    : '';

/** Reopens the OneTrust preference centre. The class is what OneTrust binds to. */
const consentPreferencesButton = () =>
  consent.enabled
    ? '<button type="button" class="footer-link ot-sdk-show-settings">Cookie preferences</button>'
    : '';

/* ---------- document shell ---------- */

export const page = ({ title, description, body, bodyClass = '', scripts = [] }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${consentScript()}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="website" />
<link rel="icon" href="/brand/inkwell.svg" type="image/svg+xml" />
<link rel="stylesheet" href="/styles/app.css" />
</head>
<body class="${bodyClass}">
${header()}
<main id="main">
${body}
</main>
${footer()}
<script src="/scripts/app.js" defer></script>
${scripts.map((src) => `<script src="${esc(src)}" defer></script>`).join('\n')}
</body>
</html>
`;
