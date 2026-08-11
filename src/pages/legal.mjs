// Privacy and Terms. Both render from the same block grammar in src/data/legal.mjs:
// { type: 'p' | 'h' | 'list' | 'table' }. Adding a clause is a data edit, never a markup edit.
import { page, section, heading, text, esc } from '../lib/ui.mjs';
import { icon } from '../lib/icons.mjs';
import { privacy, terms, legalMeta, demonstrationNotice } from '../data/legal.mjs';

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

const block = (b) => {
  switch (b.type) {
    case 'h':
      return heading(3, esc(b.body), { className: 'legal-subheading' });
    case 'list':
      return `<ul class="legal-list">${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    case 'table':
      return `<div class="table-scroll">
        <table class="data-table">
          <caption class="visually-hidden">${esc(b.caption)}</caption>
          <thead><tr>${b.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${b.rows
            .map(
              (r) =>
                `<tr>${r
                  .map((cell, i) => (i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`))
                  .join('')}</tr>`
            )
            .join('')}</tbody>
        </table>
      </div>`;
    default:
      return text(b.body, { tone: 'muted' });
  }
};

const legalSection = (s) => `
  <section class="legal-section" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-heading">
    <h2 class="heading h2 start legal-heading" id="${esc(s.id)}-heading">
      ${esc(s.heading)}<a class="anchor-link" href="#${esc(s.id)}" aria-label="Link to ${esc(s.heading)}">#</a>
    </h2>
    ${s.blocks.map(block).join('\n    ')}
  </section>`;

const tableOfContents = (doc) => `
  <nav class="legal-toc" aria-label="On this page">
    <p class="eyebrow start">On this page</p>
    <ol>
      ${doc.sections.map((s) => `<li><a href="#${esc(s.id)}">${esc(s.heading)}</a></li>`).join('\n      ')}
    </ol>
  </nav>`;

const legalPage = (doc, path) => ({
  path,
  title: `${doc.title} — Boz`,
  description: doc.summary,
  render: () =>
    page({
      title: `${doc.title} — Boz`,
      description: doc.summary,
      bodyClass: 'page-legal',
      body: [
        section(
          `${heading(1, esc(doc.title), { variant: 'h1', align: 'center' })}
           ${text(doc.summary, { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}
           <p class="legal-updated">Last updated <time datetime="${esc(legalMeta.updated)}">${esc(formatDate(legalMeta.updated))}</time> &middot; ${esc(legalMeta.entity)} &middot; ${esc(legalMeta.jurisdiction)}</p>`,
          { background: 'graph', spacing: 'md' }
        ),
        section(
          `<aside class="callout" role="note">
             <span class="callout-icon">${icon('blot', { size: 28 })}</span>
             <div>
               <p class="callout-title">Demonstration notice</p>
               ${text(esc(demonstrationNotice), { size: 'small' })}
             </div>
           </aside>
           <div class="legal-layout">
             ${tableOfContents(doc)}
             <div class="legal-body">${doc.sections.map(legalSection).join('\n')}</div>
           </div>`,
          { background: 'default', container: 'wide' }
        ),
      ].join('\n'),
    }),
});

export default [legalPage(privacy, 'privacy'), legalPage(terms, 'terms')];
