import { page, section, heading, text, preheading, button, card, esc } from '../lib/ui.mjs';
import { icon } from '../lib/icons.mjs';
import { site } from '../data/site.mjs';
import { booksIntro, bookGroups, booksCta } from '../data/books.mjs';

const bookCard = (b) =>
  card(
    `<span class="card-icon">${icon('book', { size: 36 })}</span>
     ${heading(3, esc(b.title))}
     ${text(`${b.skills.toLocaleString('en-GB')} skills mapped`, { size: 'small', className: 'skill-count' })}
     ${text(esc(b.blurb), { size: 'small', tone: 'muted' })}`,
    { className: 'book-card' }
  );

const group = (g) => `
  <div class="book-group">
    ${heading(2, esc(g.category), { variant: 'preheading', align: 'start' })}
    <div class="book-grid">${g.items.map(bookCard).join('')}</div>
  </div>`;

const title = 'Every book, one tutor — Boz';

export default [
  {
    path: 'books',
    title,
    description: esc(booksIntro.subhead),
    render: () =>
      page({
        title,
        description: booksIntro.subhead,
        bodyClass: 'page-books',
        body: [
          section(
            `${heading(1, esc(booksIntro.headline), { variant: 'display', align: 'center' })}
             ${text(esc(booksIntro.subhead), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}`,
            { background: 'graph', spacing: 'md' }
          ),
          section(bookGroups.map(group).join(''), { background: 'default', container: 'wide' }),
          section(
            `${heading(2, esc(booksCta.title), { align: 'center' })}
             ${text(esc(booksCta.subhead), { size: 'lead', align: 'center' })}
             <div class="section-cta">${button(site.cta.start.label, site.cta.start.href, { size: 'lg' })}</div>`,
            { background: 'paper', torn: true }
          ),
        ].join('\n'),
      }),
  },
];
