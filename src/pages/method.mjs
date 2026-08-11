import { page, section, heading, text, preheading, button, card, esc } from '../lib/ui.mjs';
import { icon } from '../lib/icons.mjs';
import { site } from '../data/site.mjs';
import { methodIntro, foundation, evidence, contrast, principles, evaluation, methodCta } from '../data/method.mjs';

const evidenceCard = (e) =>
  card(
    `${preheading(esc(e.source), { align: 'start' })}
     ${heading(3, esc(e.title))}
     ${text(esc(e.summary), { tone: 'muted' })}`,
    { className: 'evidence-card' }
  );

const contrastTable = () => `
  <div class="table-scroll">
    <table class="compare-table">
      <caption class="visually-hidden">${esc(contrast.title)}</caption>
      <thead><tr><th scope="col"></th>${contrast.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>
        ${contrast.rows
          .map((r) => `<tr><th scope="row">${esc(r.factor)}</th><td>${esc(r.a)}</td><td class="highlight">${esc(r.b)}</td></tr>`)
          .join('\n        ')}
      </tbody>
    </table>
  </div>`;

const principleItem = (p, i) => `
  <li class="principle">
    <span class="principle-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <div class="principle-body">
      ${heading(3, esc(p.title))}
      ${text(esc(p.principle), { size: 'lead' })}
      ${text(esc(p.basis), { tone: 'muted' })}
      ${text(`Reading: ${esc(p.citation)}`, { size: 'small', tone: 'muted', className: 'card-citation' })}
    </div>
  </li>`;

const evalCard = (e) => card(`${heading(3, esc(e.title))}${text(esc(e.detail), { size: 'small', tone: 'muted' })}`, { className: 'eval-card' });

const title = 'Our method — Boz';

export default [
  {
    path: 'method',
    title,
    description: methodIntro.subhead,
    render: () =>
      page({
        title,
        description: methodIntro.subhead,
        bodyClass: 'page-method',
        body: [
          section(
            `${heading(1, esc(methodIntro.headline), { variant: 'display', align: 'center' })}
             ${text(esc(methodIntro.subhead), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}`,
            { background: 'graph', spacing: 'md' }
          ),
          section(
            `${preheading(esc(foundation.eyebrow))}
             ${heading(2, esc(foundation.title), { variant: 'h1', align: 'center' })}
             <div class="prose">
               ${foundation.body.map((p) => text(esc(p), { size: 'lead', tone: 'muted' })).join('\n               ')}
               ${text(`Reading: ${esc(foundation.citation)}`, { size: 'small', tone: 'muted', className: 'card-citation' })}
             </div>`,
            { background: 'paper', torn: true }
          ),
          section(
            `${preheading('The evidence')}
             <div class="evidence-grid">${evidence.map(evidenceCard).join('')}</div>`,
            { background: 'default', container: 'wide' }
          ),
          section(
            `${heading(2, esc(contrast.title), { variant: 'h1', align: 'center' })}
             ${text(esc(contrast.intro), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}
             ${contrastTable()}`,
            { background: 'graph' }
          ),
          section(
            `${preheading('Our approach')}
             ${heading(2, 'Five decisions, applied every turn', { variant: 'h1', align: 'center' })}
             <ol class="principle-list">${principles.map(principleItem).join('')}</ol>`,
            { background: 'paper', torn: true }
          ),
          section(
            `${preheading('Evaluation')}
             ${heading(2, 'How we measure whether it teaches', { variant: 'h1', align: 'center' })}
             <div class="eval-grid">${evaluation.map(evalCard).join('')}</div>`,
            { background: 'default', container: 'wide' }
          ),
          section(
            `<span class="cta-icon">${icon('heart')}</span>
             ${heading(2, esc(methodCta.title), { align: 'center' })}
             ${text(esc(methodCta.subhead), { size: 'lead', align: 'center' })}
             <div class="section-cta">${button(site.cta.start.label, site.cta.start.href, { size: 'lg' })}</div>`,
            { background: 'accent', spacing: 'md' }
          ),
        ].join('\n'),
      }),
  },
];
