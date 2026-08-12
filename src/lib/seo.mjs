// SEO helpers: absolute URLs and JSON-LD builders.
//
// Truthfulness rule for this file: Boz is a fictional demonstration product, so the graph
// describes what is actually on the page (pages, articles, lists, questions) and states that
// the company is a demonstration. It deliberately emits no Offer, Review or AggregateRating —
// those assert commercial facts about a product that does not exist, which is the "schema for
// content that is not actually present" anti-pattern.
import { site } from '../data/site.mjs';

const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/$/, '');

export const seoConfig = {
  siteUrl: SITE_URL,
  basePath: BASE_PATH,
  locale: 'en_GB',
  sameAs: ['https://github.com/utsavgwa/demofiles2'],
};

/** Absolute URL for a page path, or a root-relative one when SITE_URL is unknown. */
export const absoluteUrl = (path = '/') => {
  const suffix = path === '/' ? '/' : `/${path.replace(/^\//, '')}`;
  return SITE_URL ? `${SITE_URL}${BASE_PATH}${suffix}` : `${BASE_PATH}${suffix}`;
};

export const ogImageUrl = () => absoluteUrl('og-image.png');

const ORG_ID = () => `${absoluteUrl('/')}#organization`;
const SITE_ID = () => `${absoluteUrl('/')}#website`;

const stripTags = (html) => String(html).replace(/<[^>]+>/g, '');

/* ---------------------------------------------------------------- entities */

export const organization = () => ({
  '@type': 'Organization',
  '@id': ORG_ID(),
  name: site.legalEntity,
  alternateName: site.name,
  url: absoluteUrl('/'),
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('brand/inkwell.svg'),
    caption: `${site.name} inkwell mark`,
  },
  description: 'Boz is a voice-first reading tutor for students aged 9 to 18, built around one book at a time.',
  disambiguatingDescription:
    'Demonstration build. Boz Learning Ltd. is a fictional company; the site exists as a technical and design exercise.',
  sameAs: seoConfig.sameAs,
  knowsAbout: ['Reading comprehension', 'Charles Dickens', 'Literature tutoring', 'Socratic teaching'],
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': SITE_ID(),
  name: site.name,
  url: absoluteUrl('/'),
  description: site.tagline,
  inLanguage: 'en-GB',
  publisher: { '@id': ORG_ID() },
});

/* ------------------------------------------------------------------ pages */

export const breadcrumbs = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

export const webPage = ({ path, title, description, type = 'WebPage', extra = {} }) => ({
  '@type': type,
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name: title,
  description,
  inLanguage: 'en-GB',
  isPartOf: { '@id': SITE_ID() },
  about: { '@id': ORG_ID() },
  ...extra,
});

export const faqPage = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: stripTags(item.a) },
  })),
});

export const blogPosting = ({ path, title, description, datePublished, body }) => ({
  '@type': 'BlogPosting',
  '@id': `${absoluteUrl(path)}#article`,
  headline: title,
  description,
  datePublished,
  dateModified: datePublished,
  inLanguage: 'en-GB',
  wordCount: body.join(' ').split(/\s+/).length,
  mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` },
  image: ogImageUrl(),
  author: { '@id': ORG_ID() },
  publisher: { '@id': ORG_ID() },
});

export const itemList = (name, items) => ({
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    ...(item.url ? { url: item.url } : {}),
    ...(item.description ? { description: item.description } : {}),
  })),
});

/* ---------------------------------------------------------------- assembly */

/** One @graph per page keeps every node cross-referenced by @id. */
export const graph = (nodes) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
