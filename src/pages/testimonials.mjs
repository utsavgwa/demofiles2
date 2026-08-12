import { page, section, heading, text, button, esc } from '../lib/ui.mjs';
import { webPage, breadcrumbs } from '../lib/seo.mjs';
import { site } from '../data/site.mjs';
import { testimonials, testimonialsIntro } from '../data/testimonials.mjs';

const wallCard = (t) => `
  <article class="testimonial-card wall">
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

const title = 'Testimonials — Boz';

export default [
  {
    path: 'testimonials',
    title,
    description: testimonialsIntro.subhead,
    render: () =>
      page({
        path: 'testimonials',
        // No Review or AggregateRating: the quotations are fiction, and marking them up as
        // customer reviews would assert something untrue to search engines.
        structuredData: [
          webPage({ path: 'testimonials', title, description: testimonialsIntro.subhead, type: 'CollectionPage' }),
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Testimonials', path: 'testimonials' }]),
        ],
        title,
        description: testimonialsIntro.subhead,
        bodyClass: 'page-testimonials',
        body: [
          section(
            `${heading(1, esc(testimonialsIntro.headline), { variant: 'display', align: 'center' })}
             ${text(esc(testimonialsIntro.subhead), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}`,
            { background: 'graph', spacing: 'md' }
          ),
          section(`<div class="testimonial-wall">${testimonials.map(wallCard).join('')}</div>`, {
            background: 'paper',
            torn: true,
            container: 'wide',
          }),
          section(
            `${heading(2, 'Try it for yourself', { align: 'center' })}
             <div class="section-cta">${button(site.cta.start.label, site.cta.start.href, { size: 'lg' })}</div>`,
            { background: 'default', spacing: 'md' }
          ),
        ].join('\n'),
      }),
  },
];
