import { page, section, heading, text, preheading, eyebrow, button, ctaLink, card, esc } from '../lib/ui.mjs';
import { icon, heroScene } from '../lib/icons.mjs';
import { site } from '../data/site.mjs';
import { hero, schools, differentiator, approach, mission, homeBlogTeasers } from '../data/home.mjs';
import { testimonials } from '../data/testimonials.mjs';
import { bySlug, formatDate } from '../data/blog.mjs';

const heroSection = () => `
<section class="section graph spacing-lg hero">
  <div class="container wide hero-inner">
    <div class="hero-text">
      ${heading(1, esc(hero.headline).replace('\n', '<br />'), { variant: 'display' })}
      ${text(esc(hero.subhead), { size: 'lead', tone: 'muted', className: 'hero-subhead' })}
      <div class="hero-cta">
        ${button(site.cta.start.label, site.cta.start.href, { variant: 'gradient', size: 'lg' })}
        ${button(site.cta.secondary.label, site.cta.secondary.href, { variant: 'ghost', size: 'lg' })}
      </div>
    </div>
    <div class="hero-figure">
      <span class="hero-sticker hero-sticker-left">${icon('quill')}</span>
      <span class="hero-sticker hero-sticker-right">${icon('blot')}</span>
      ${heroScene()}
    </div>
  </div>
</section>`;

const schoolStrip = () => {
  const row = schools.map((s) => `<li class="school-logo">${esc(s)}</li>`).join('');
  return `
<section class="school-strip">
  ${preheading('Trusted by families at')}
  <div class="school-track" aria-hidden="true"><ul class="school-row">${row}</ul><ul class="school-row">${row}</ul></div>
  <ul class="visually-hidden">${row}</ul>
</section>`;
};

const differentiatorSection = () =>
  section(
    `${heading(2, esc(differentiator.line1), { align: 'center' })}
     ${heading(2, esc(differentiator.line2), { align: 'center', className: 'bold' })}`,
    { background: 'graph', container: 'default' }
  );

const testimonialCard = (t) => `
  <article class="testimonial-card">
    <span class="card-tape" aria-hidden="true"></span>
    ${text(`&ldquo;${esc(t.quote)}&rdquo;`, { className: 'testimonial-quote' })}
    <footer class="testimonial-meta">
      <span class="testimonial-avatar" aria-hidden="true">${esc(t.name.charAt(0))}</span>
      <span>
        <span class="testimonial-name">${esc(t.name)}</span>
        <span class="testimonial-location">${esc(t.role)} &middot; ${esc(t.location)}</span>
      </span>
    </footer>
  </article>`;

const testimonialsSection = () => {
  const shown = testimonials.slice(0, 9);
  return section(
    `${heading(2, 'What families are telling us', { variant: 'h1' })}
     <div class="carousel" data-carousel data-per-view="3">
       <div class="carousel-track">${shown.map(testimonialCard).join('')}</div>
       <div class="carousel-dots" role="tablist" aria-label="Testimonial pages"></div>
     </div>
     <div class="section-cta">${ctaLink('See why families love Boz', '/testimonials')}</div>`,
    { background: 'paper', container: 'wide', torn: true, className: 'testimonials-section' }
  );
};

const approachCard = (item) =>
  card(
    `<span class="card-icon">${icon(item.icon)}</span>
     ${heading(3, esc(item.title))}
     ${text(esc(item.summary), { tone: 'muted' })}
     ${text(`Reading: ${esc(item.citation)}`, { size: 'small', tone: 'muted', className: 'card-citation' })}`,
    { className: 'approach-card' }
  );

const approachSection = () =>
  section(
    `${preheading('Method-driven')}
     ${heading(2, 'How Boz works', { variant: 'h1', align: 'center' })}
     <div class="carousel" data-carousel data-per-view="3">
       <div class="carousel-track">${approach.map(approachCard).join('')}</div>
       <div class="carousel-dots" role="tablist" aria-label="Method pages"></div>
     </div>
     <div class="section-cta">${ctaLink('Read our method', '/method')}</div>`,
    { background: 'graph', container: 'wide' }
  );

const missionSection = () =>
  section(
    `${preheading(esc(mission.eyebrow))}
     ${heading(2, esc(mission.title), { variant: 'h1', align: 'center' })}
     <div class="prose">
       ${mission.paragraphs.map((p) => text(esc(p), { size: 'lead', tone: 'muted' })).join('\n       ')}
       ${text(`&mdash; ${esc(mission.signature)}, ${esc(mission.signatureRole)}`, { className: 'signature' })}
       ${text(esc(mission.footnote), { size: 'small', tone: 'muted' })}
     </div>`,
    { background: 'paper', container: 'default', torn: true }
  );

const blogCard = (slug) => {
  const post = bySlug(slug);
  return `<a class="blog-card" href="/blog/${esc(post.slug)}">
    <span class="blog-card-art">${icon('book', { size: 64 })}</span>
    ${eyebrow(`${esc(post.eyebrow)} &middot; ${esc(formatDate(post.date))}`)}
    ${heading(3, esc(post.title))}
    ${text(esc(post.excerpt), { size: 'small', tone: 'muted' })}
  </a>`;
};

const blogSection = () =>
  section(
    `${preheading('More words from us', { align: 'start' })}
     <div class="blog-grid">${homeBlogTeasers.map(blogCard).join('')}</div>`,
    { background: 'graph', container: 'wide' }
  );

export default [
  {
    path: '/',
    title: 'Boz — the tutor who has read every book',
    description:
      'Boz is a voice-first reading tutor for ages 9 to 18. It learns how your child reads, then teaches the way they think best.',
    render: () =>
      page({
        title: 'Boz — the tutor who has read every book',
        description:
          'Boz is a voice-first reading tutor for ages 9 to 18. It learns how your child reads, then teaches the way they think best.',
        bodyClass: 'page-home',
        body: [
          heroSection(),
          schoolStrip(),
          differentiatorSection(),
          testimonialsSection(),
          approachSection(),
          missionSection(),
          blogSection(),
        ].join('\n'),
      }),
  },
];
