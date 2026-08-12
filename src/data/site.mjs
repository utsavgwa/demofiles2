// Global site chrome: brand, navigation, footer, calls to action.
// All content is fictional and Dickens-derived (public domain).
// Consent is off until a real OneTrust domain id is supplied at build time, so no page
// ever ships a broken banner script with a placeholder id. Set ONETRUST_DOMAIN_ID in the
// environment (the deploy workflow reads it from a repository variable) to switch it on.
const domainScriptId = process.env.ONETRUST_DOMAIN_ID ?? '';

export const consent = {
  provider: 'OneTrust',
  domainScriptId,
  enabled: Boolean(domainScriptId),
};

export const site = {
  name: 'Boz',
  legalEntity: 'Boz Learning Ltd.',
  year: 2026,
  tagline: 'The tutor who has read every book',
  cta: {
    primary: { label: 'Meet Boz', href: '/go/onboard' },
    secondary: { label: 'Sign in', href: '/go/signin' },
    start: { label: 'Get started', href: '/go/onboard' },
  },
  nav: {
    left: [
      { label: 'Manifesto', href: '/blog/why-every-reader-needs-a-tutor' },
      { label: 'Method', href: '/method' },
    ],
    right: [{ label: 'Blog', href: '/blog' }],
  },
  footer: {
    columns: [
      {
        title: 'Learn more',
        links: [
          { label: 'How it works', href: '/' },
          { label: 'Our method', href: '/method' },
          { label: 'All books', href: '/books' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Testimonials', href: '/testimonials' },
        ],
      },
      {
        title: 'About us',
        links: [
          { label: 'Blog', href: '/blog' },
          { label: 'Careers', href: '/careers' },
          { label: 'Fellows', href: '/fellows' },
          { label: 'Reading Fellowship', href: '/fellowship' },
        ],
      },
      {
        title: 'Get started',
        links: [
          { label: 'Meet Boz', href: '/go/onboard' },
          { label: 'Sign in', href: '/go/signin' },
        ],
      },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
};
