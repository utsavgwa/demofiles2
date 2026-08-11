// Inline SVG art. Kept in JS so the markup ships with the page (no extra requests)
// and inherits colour from CSS custom properties.
const wrap = (body, { size = 48, viewBox = '0 0 48 48', className = '' } = {}) =>
  `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="${viewBox}" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const stroke = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  chat: () =>
    wrap(`<path ${stroke} d="M6 12a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H18l-8 6v-6a4 4 0 0 1-4-4z"/>
      <path ${stroke} d="M13 16h14M13 21h9"/>`),
  lens: () =>
    wrap(`<circle cx="21" cy="21" r="12" ${stroke}/><path ${stroke} d="m30 30 9 9"/>
      <path ${stroke} d="M16 22c2-4 8-4 10 0"/>`),
  compass: () =>
    wrap(`<circle cx="24" cy="24" r="16" ${stroke}/><path ${stroke} d="m31 17-5 12-12 5 5-12z"/>
      <circle cx="24" cy="24" r="1.8" fill="currentColor"/>`),
  seal: () =>
    wrap(`<path ${stroke} d="M24 6l4.6 3.2 5.6-.4 1.6 5.4 4.4 3.5-2.6 5 .9 5.6-5.4 1.7-3.4 4.5-5.7-1.2-5.7 1.2-3.4-4.5-5.4-1.7.9-5.6-2.6-5 4.4-3.5 1.6-5.4 5.6.4z"/>
      <path ${stroke} d="m19 22 4 4 7-8"/>`),
  spark: () =>
    wrap(`<path ${stroke} d="M24 5v7M24 36v7M5 24h7M36 24h7M11 11l5 5M32 32l5 5M37 11l-5 5M16 32l-5 5"/>
      <circle cx="24" cy="24" r="7" ${stroke}/>`),
  quill: () =>
    wrap(`<path ${stroke} d="M8 40c6-16 16-26 32-32-2 18-12 28-26 30"/><path ${stroke} d="M8 40l10-10"/>`),
  heart: () =>
    wrap(`<path ${stroke} d="M24 40S8 30 8 19a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 11-16 21-16 21z"/>`),
  blot: () =>
    wrap(`<path ${stroke} d="M24 8c5 8 12 12 12 19a12 12 0 1 1-24 0c0-7 7-11 12-19z"/>
      <circle cx="36" cy="12" r="2.4" ${stroke}/>`),
  book: () =>
    wrap(`<path ${stroke} d="M8 10h12a6 6 0 0 1 4 1.6A6 6 0 0 1 28 10h12v26H28a6 6 0 0 0-4 1.6A6 6 0 0 0 20 36H8z"/>
      <path ${stroke} d="M24 11.6V37.6"/>`),
  check: () => wrap(`<path ${stroke} d="m10 25 8 8 20-20"/>`, { size: 20, viewBox: '0 0 48 48' }),
};

export const icon = (name, opts) => (icons[name] ?? icons.book)(opts);

/** Hero scene: a child reading at a desk with an inkwell, drawn as flat line art. */
export const heroScene = () => `
<svg class="hero-art" viewBox="0 0 520 420" role="img" aria-label="A child reading at a desk beside an inkwell and a stack of books" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="var(--palette-core-800)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 340h440" />
    <path d="M96 340v46M464 340v46" />
    <path d="M62 340c0-14 10-24 24-24h380c14 0 26 10 26 24" fill="var(--palette-core-200)" />
    <g fill="var(--palette-lemon)"><path d="M118 316h150l-14-26H132z" /></g>
    <g fill="var(--palette-core-0)"><path d="M132 290h122l-10-22H140z" /></g>
    <path d="M196 268v48" />
    <g fill="var(--palette-fuji-300)"><path d="M300 316h96v-16h-96z" /></g>
    <g fill="var(--palette-blue)"><path d="M306 300h96v-16h-96z" /></g>
    <g fill="var(--palette-lime)"><path d="M300 284h88v-16h-88z" /></g>
    <g fill="var(--palette-core-700)"><path d="M424 316h34v-30c0-9-7-16-17-16s-17 7-17 16z" /></g>
    <path d="M441 270v-26" />
    <path d="M441 244c14-16 26-26 44-32-4 20-16 30-32 34" fill="var(--palette-core-0)" />
    <g fill="var(--palette-apricot)"><circle cx="196" cy="150" r="46" /></g>
    <path d="M172 146c4-6 12-6 16 0M204 146c4-6 12-6 16 0" />
    <path d="M182 172c8 8 20 8 28 0" />
    <path d="M150 140c6-40 40-58 70-46 24 10 26 34 22 46" fill="var(--palette-core-800)" />
    <path d="M154 196c-22 8-38 30-40 62h164c-2-32-18-54-40-62" fill="var(--palette-berry)" />
  </g>
</svg>`;
