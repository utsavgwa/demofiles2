import { page, section, heading, text, eyebrow, button, ctaLink, esc } from '../lib/ui.mjs';
import { icon } from '../lib/icons.mjs';
import { site } from '../data/site.mjs';
import { posts, blogIntro, formatDate } from '../data/blog.mjs';

const postCard = (p) => `
  <a class="blog-card" href="/blog/${esc(p.slug)}">
    <span class="blog-card-art">${icon('book', { size: 64 })}</span>
    ${eyebrow(`${esc(p.eyebrow)} &middot; ${esc(formatDate(p.date))}`)}
    ${heading(2, esc(p.title), { variant: 'h3' })}
    ${text(esc(p.excerpt), { size: 'small', tone: 'muted' })}
  </a>`;

const index = {
  path: 'blog',
  title: 'Blog — Boz',
  description: blogIntro.subhead,
  render: () =>
    page({
      title: 'Blog — Boz',
      description: blogIntro.subhead,
      bodyClass: 'page-blog',
      body: [
        section(
          `${heading(1, esc(blogIntro.headline), { variant: 'display', align: 'center' })}
           ${text(esc(blogIntro.subhead), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}`,
          { background: 'graph', spacing: 'md' }
        ),
        section(`<div class="blog-grid">${posts.map(postCard).join('')}</div>`, { background: 'default', container: 'wide' }),
      ].join('\n'),
    }),
};

const postPage = (post) => ({
  path: `blog/${post.slug}`,
  title: `${post.title} — Boz`,
  description: post.excerpt,
  render: () =>
    page({
      title: `${post.title} — Boz`,
      description: post.excerpt,
      bodyClass: 'page-post',
      body: [
        section(
          `${eyebrow(`${esc(post.eyebrow)} &middot; ${esc(formatDate(post.date))}`, { align: 'center' })}
           ${heading(1, esc(post.title), { variant: 'h1', align: 'center' })}
           ${text(esc(post.excerpt), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}`,
          { background: 'graph', spacing: 'md' }
        ),
        section(
          `<article class="prose post-body">
             ${post.body.map((p) => text(p, { size: 'body' })).join('\n             ')}
           </article>
           <div class="section-cta">${ctaLink('Back to all posts', '/blog')}</div>`,
          { background: 'default', container: 'narrow' }
        ),
        section(
          `${heading(2, 'Meet the tutor your child argues with', { align: 'center' })}
           <div class="section-cta">${button(site.cta.start.label, site.cta.start.href, { size: 'lg' })}</div>`,
          { background: 'paper', torn: true, spacing: 'md' }
        ),
      ].join('\n'),
    }),
});

export default [index, ...posts.map(postPage)];
