// Secondary pages: waitlist onboarding, sign in, hiring, 404.
//
// The two /go/* pages capture what the visitor types. There is no server, so capture means
// localStorage: the entry is written, read back on the next visit, shown in a confirmation
// panel, and can be edited, copied or deleted by the person who wrote it. The panel markup
// lives here; scripts/waitlist.js only fills the data-slot nodes, so no HTML is built in JS.
import { page, section, heading, text, preheading, button, ctaLink, field, esc } from '../lib/ui.mjs';
import { icon } from '../lib/icons.mjs';
import { site } from '../data/site.mjs';
import { webPage, breadcrumbs } from '../lib/seo.mjs';

const simple = ({ path, title, description, body, background = 'graph' }) => ({
  path,
  title: `${title} — Boz`,
  description,
  render: () =>
    page({
      path,
      structuredData: [
        webPage({ path, title: `${title} — Boz`, description }),
        breadcrumbs([{ name: 'Home', path: '/' }, { name: title, path }]),
      ],
      title: `${title} — Boz`,
      description,
      bodyClass: `page-${path.replace(/\//g, '-')}`,
      body: [
        section(
          `${heading(1, esc(title), { variant: 'h1', align: 'center' })}
           ${text(esc(description), { size: 'lead', tone: 'muted', align: 'center', className: 'measure-center' })}`,
          { background, spacing: 'md' }
        ),
        section(`<div class="prose">${body}</div>`, { background: 'default', container: 'narrow' }),
      ].join('\n'),
    }),
});

const detail = (label, slot) => `
        <div class="detail-row">
          <dt>${esc(label)}</dt>
          <dd data-slot="${esc(slot)}"></dd>
        </div>`;

const storageNote = `${text(
  'Saved in this browser only — it is never sent anywhere. <a href="/privacy#what-we-collect">What we store and why</a>.',
  { size: 'small', tone: 'muted', className: 'storage-note' }
)}`;

const onboard = {
  path: 'go/onboard',
  title: 'Join the waitlist — Boz',
  description: 'Save your place for three free one-hour sessions with Boz.',
  render: () =>
    page({
      path: 'go/onboard',
      structuredData: [
        webPage({
          path: 'go/onboard',
          title: 'Join the waitlist — Boz',
          description: 'Save your place for three free one-hour sessions with Boz.',
        }),
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Join the waitlist', path: 'go/onboard' }]),
      ],
      title: 'Join the waitlist — Boz',
      description: 'Save your place for three free one-hour sessions with Boz.',
      bodyClass: 'page-onboard',
      scripts: ['/scripts/waitlist.js'],
      body: section(
        `<div class="form-card" data-waitlist>
          <div class="form-view" data-view="form">
            <span class="cta-icon">${icon('quill', { size: 40 })}</span>
            ${heading(1, 'Save your place', { variant: 'h1', align: 'center' })}
            ${text('Three free one-hour sessions when we open your child’s year group. No card, no clerk, no queue at the door.', {
              tone: 'muted',
              align: 'center',
              className: 'measure-center',
            })}
            <form class="stack-form" novalidate data-waitlist-form>
              ${field({
                id: 'email',
                label: 'Parent email',
                type: 'email',
                required: true,
                autocomplete: 'email',
                placeholder: 'micawber@example.com',
                hint: 'We write once, when a place opens.',
              })}
              ${field({
                id: 'child',
                label: "Student’s first name",
                required: true,
                autocomplete: 'off',
                placeholder: 'Pip',
                hint: 'First name only. We never ask for a surname or a school.',
              })}
              ${field({
                id: 'year',
                label: 'Year group',
                options: ['Year 5 to 6', 'Year 7 to 8', 'Year 9 to 11', 'Sixth form'],
                hint: 'Places open one year group at a time.',
              })}
              ${field({
                id: 'book',
                label: 'First book',
                options: ['Great Expectations', 'A Christmas Carol', 'Oliver Twist', 'Bleak House', 'David Copperfield', 'Hard Times'],
                hint: 'Changeable later — every title is included.',
              })}
              <button class="button gradient md form-submit" type="submit">Join the waitlist</button>
              ${storageNote}
            </form>
            <noscript>
              ${text('This form needs JavaScript to save your place, because the site has no server to post to.', {
                size: 'small',
                tone: 'muted',
              })}
            </noscript>
          </div>

          <section class="result-panel" data-view="result" hidden tabindex="-1" aria-labelledby="waitlist-result-heading">
            <span class="result-check" aria-hidden="true">${icon('seal', { size: 44 })}</span>
            ${heading(2, 'You’re on the waitlist', { variant: 'h1', align: 'center', className: 'result-heading', id: 'waitlist-result-heading' })}
            ${text('', { align: 'center', className: 'result-lede measure-center', })}
            <dl class="result-details">
              ${detail('Reference', 'reference')}
              ${detail('Queue position', 'position')}
              ${detail('Parent email', 'email')}
              ${detail('Student', 'child')}
              ${detail('Year group', 'year')}
              ${detail('First book', 'book')}
              ${detail('Saved', 'submitted')}
            </dl>
            ${preheading('What happens next', { align: 'start' })}
            <ol class="next-steps">
              <li><span class="step-index" aria-hidden="true">1</span><span>We open places one year group at a time, oldest requests first.</span></li>
              <li><span class="step-index" aria-hidden="true">2</span><span>You get one email with a link to set the first session.</span></li>
              <li><span class="step-index" aria-hidden="true">3</span><span>Your child talks to Boz about chapter one. It takes about an hour.</span></li>
            </ol>
            <div class="result-actions">
              <button class="button secondary sm" type="button" data-action="edit">Edit details</button>
              <button class="button secondary sm" type="button" data-action="copy">Copy reference</button>
              <button class="button ghost-danger sm" type="button" data-action="remove">Remove my entry</button>
            </div>
            ${storageNote}
          </section>

          <p class="form-status" data-status role="status" aria-live="polite"></p>
        </div>`,
        { background: 'graph', container: 'narrow', spacing: 'md' }
      ),
    }),
};

const signin = {
  path: 'go/signin',
  // Auth surfaces carry no search value and should not compete with the waitlist page.
  noindex: true,
  title: 'Sign in — Boz',
  description: 'Sign in to your family account with a link sent to your email.',
  render: () =>
    page({
      path: 'go/signin',
      noindex: true,
      structuredData: [
        webPage({
          path: 'go/signin',
          title: 'Sign in — Boz',
          description: 'Sign in to your family account with a link sent to your email.',
        }),
      ],
      title: 'Sign in — Boz',
      description: 'Sign in to your family account with a link sent to your email.',
      bodyClass: 'page-signin',
      scripts: ['/scripts/waitlist.js'],
      body: section(
        `<div class="form-card" data-signin>
          <div class="form-view" data-view="form">
            ${heading(1, 'Welcome back', { variant: 'h1', align: 'center' })}
            ${text('We send a one-time link instead of asking for a password. Nothing to remember, nothing to leak.', {
              tone: 'muted',
              align: 'center',
              className: 'measure-center',
            })}
            <form class="stack-form" novalidate data-signin-form>
              ${field({
                id: 'signin-email',
                label: 'Email',
                type: 'email',
                required: true,
                autocomplete: 'email',
                placeholder: 'micawber@example.com',
                hint: 'The address on your family account.',
              })}
              <button class="button gradient md form-submit" type="submit">Email me a link</button>
            </form>
            <div class="section-cta">${ctaLink('New here? Join the waitlist', site.cta.primary.href)}</div>
          </div>

          <section class="result-panel" data-view="result" hidden tabindex="-1" aria-labelledby="signin-result-heading">
            <span class="result-check" aria-hidden="true">${icon('seal', { size: 44 })}</span>
            ${heading(2, 'Check your inbox', { variant: 'h1', align: 'center', className: 'result-heading', id: 'signin-result-heading' })}
            ${text('', { align: 'center', className: 'result-lede measure-center' })}
            <p class="result-aside" data-slot="waitlist" hidden></p>
            <div class="result-actions">
              <button class="button secondary sm" type="button" data-action="resend">Resend link</button>
              <button class="button ghost-danger sm" type="button" data-action="edit">Use a different email</button>
            </div>
            ${text('Demonstration build: no email is sent and no account exists.', { size: 'small', tone: 'muted' })}
          </section>

          <p class="form-status" data-status role="status" aria-live="polite"></p>
        </div>`,
        { background: 'graph', container: 'narrow', spacing: 'md' }
      ),
    }),
};

const notFound = {
  path: '404',
  noindex: true,
  title: 'Page not found — Boz',
  description: 'That page is not on the shelf.',
  render: () =>
    page({
      path: '404',
      noindex: true,
      title: 'Page not found — Boz',
      description: 'That page is not on the shelf.',
      bodyClass: 'page-404',
      body: section(
        `<span class="cta-icon">${icon('blot')}</span>
         ${heading(1, '404', { variant: 'display', align: 'center' })}
         ${text('&ldquo;It is a far, far better page that you go to, than any you have ever known.&rdquo;', {
           size: 'lead',
           tone: 'muted',
           align: 'center',
         })}
         <div class="section-cta">${button('Back to the shelf', '/', { size: 'lg' })}</div>`,
        { background: 'graph', spacing: 'lg' }
      ),
    }),
};

const careers = simple({
  path: 'careers',
  title: 'Careers',
  description:
    'Working at Boz: a small team building one reading tutor carefully. What we look for, and how we hire readers who can build.',
  body: `${text('We hire readers who can build and builders who read. Roles are posted here when they open; this demonstration build lists none.', { tone: 'muted' })}
    ${preheading('What we look for', { align: 'start' })}
    <ul class="tick-list">
      ${['Care about the child on the other end of the session', 'Write clearly enough to be argued with', 'Ship small things weekly']
        .map((l) => `<li><span class="tick">${icon('check', { size: 18 })}</span>${l}</li>`)
        .join('')}
    </ul>`,
});

const fellows = simple({
  path: 'fellows',
  title: 'Fellows',
  description:
    'Boz Fellows are teachers and students who read real tutoring sessions, mark them, and tell us where the tutor talks too much.',
  body: `${text('Fellows read sessions, mark them, and tell us where the tutor talked too much. They are paid, credited, and listened to.', { tone: 'muted' })}
    ${text('Applications for the 2026 cohort are closed in this demonstration build.', { tone: 'muted' })}`,
});

const fellowship = simple({
  path: 'fellowship',
  title: 'Reading Fellowship',
  description:
    'The Boz Reading Fellowship: twelve funded weeks, one long novel, weekly seminars and a stipend, for students aged 14 to 18.',
  body: `${text('Twelve weeks, one long novel, weekly seminars, and a stipend. Open to students aged 14 to 18.', { tone: 'muted' })}
    ${text('This page is a placeholder in the replica build; no applications are collected.', { tone: 'muted' })}`,
});

export default [onboard, signin, careers, fellows, fellowship, notFound];
