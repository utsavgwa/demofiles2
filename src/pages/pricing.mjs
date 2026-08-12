import { page, section, heading, text, preheading, button, card, esc } from '../lib/ui.mjs';
import { webPage, breadcrumbs, itemList, faqPage } from '../lib/seo.mjs';
import { icon } from '../lib/icons.mjs';
import { site } from '../data/site.mjs';
import { plans, comparison, pricingFaq, pricingIntro } from '../data/pricing.mjs';

const planCard = (p) =>
  card(
    `${p.featured ? '<span class="plan-badge">Best value</span>' : ''}
     ${heading(2, esc(p.name), { variant: 'h3', className: 'plan-name' })}
     <p class="plan-price"><span class="plan-amount">${esc(p.price)}</span><span class="plan-period">${esc(p.period)}</span></p>
     ${text(esc(p.sessions), { size: 'small', tone: 'muted' })}
     <ul class="plan-features">
       ${p.features.map((f) => `<li><span class="tick">${icon('check', { size: 18 })}</span>${esc(f)}</li>`).join('\n       ')}
     </ul>
     ${button(site.cta.start.label, site.cta.start.href, { variant: p.featured ? 'gradient' : 'secondary', size: 'md' })}`,
    { className: `plan-card${p.featured ? ' featured' : ''}` }
  );

const comparisonTable = () => `
  <div class="table-scroll">
    <table class="compare-table">
      <caption class="visually-hidden">${esc(comparison.title)}</caption>
      <thead><tr><th scope="col"></th>${comparison.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>
        ${comparison.rows
          .map(
            (r) =>
              `<tr><th scope="row">${esc(r.factor)}</th><td>${esc(r.human)}</td><td class="highlight">${esc(r.boz)}</td></tr>`
          )
          .join('\n        ')}
      </tbody>
    </table>
  </div>`;

const faqItem = (item) => `
    <details class="faq-item">
      <summary>${esc(item.q)}</summary>
      ${text(item.a, { tone: 'muted' })}
    </details>`;

const title = 'Pricing — Boz';

export default [
  {
    path: 'pricing',
    title,
    description: pricingIntro.subhead,
    render: () =>
      page({
        path: 'pricing',
        structuredData: [
          webPage({ path: 'pricing', title, description: pricingIntro.subhead }),
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Pricing', path: 'pricing' }]),
          // Plans are listed, not offered: no Offer or price node, because nothing here is
          // actually purchasable.
          itemList(
            'Boz plans',
            plans.map((p) => ({ name: p.name, description: `${p.price}${p.period} — ${p.sessions}` }))
          ),
          faqPage(pricingFaq),
        ],
        title,
        description: pricingIntro.subhead,
        bodyClass: 'page-pricing',
        body: [
          section(
            `${heading(1, esc(pricingIntro.headline), { variant: 'display', align: 'center' })}
             ${text(esc(pricingIntro.subhead), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}
             <div class="plan-grid">${plans.map(planCard).join('')}</div>`,
            { background: 'graph', spacing: 'md', container: 'wide' }
          ),
          section(
            `${preheading('The comparison')}
             ${heading(2, esc(comparison.title), { align: 'center' })}
             ${comparisonTable()}`,
            { background: 'paper', torn: true, container: 'default' }
          ),
          section(
            `${heading(2, 'Questions families ask', { align: 'center' })}
             <div class="faq-list">${pricingFaq.map(faqItem).join('')}</div>`,
            { background: 'default', container: 'narrow' }
          ),
          section(
            `${heading(2, 'Start with three free sessions', { align: 'center' })}
             <div class="section-cta">${button(site.cta.start.label, site.cta.start.href, { size: 'lg' })}</div>`,
            { background: 'accent', spacing: 'md' }
          ),
        ].join('\n'),
      }),
  },
];
