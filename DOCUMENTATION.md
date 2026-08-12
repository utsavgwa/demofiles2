# Boz — a static replica of heyaristotle.com

**What this is.** An end-to-end analysis of `https://www.heyaristotle.com/`, and a working
static replica of it built with the smallest tech stack that does the job, with every piece of
content replaced by dummy copy drawn from the works of Charles Dickens (public domain).

**Contents**

1. [Source analysis](#1-source-analysis)
2. [Product requirements document](#2-product-requirements-document)
3. [Technical architecture](#3-technical-architecture)
4. [Tech stack and decision log](#4-tech-stack-and-decision-log)
5. [Content mapping and IP position](#5-content-mapping-and-ip-position)
6. [Verification](#6-verification)
7. [Running, extending, deploying](#7-running-extending-deploying)

---

## 1. Source analysis

### 1.1 What the product is

Aristotle is a consumer subscription: a voice-first AI tutor sold to **parents** of school-age
children (roughly grades 5–12, plus early college). The site is a single conversion funnel —
every page terminates in `/go/onboard`. It is not a docs site, not a SaaS console marketing
site; it is a **trust-building landing system** for a purchase decision made by an anxious
parent in about four minutes.

### 1.2 Information architecture (crawled)

```
/                        home — hero, social proof, differentiator, testimonials, method, mission, blog
/research                the evidence page — the trust engine of the whole site
/subjects                catalogue: 17 subjects, each with a "skills mapped" count
/pricing                 3 plans, human-tutor comparison table, FAQ
/testimonials            18 quotes, masonry wall
/blog, /blog/<slug>      manifesto + essays
/careers /fellows /content-fellowship
/privacy /terms
/go/onboard /go/signin   app handoff (out of the marketing codebase)
```

Navigation is **split around a centred logo**: Manifesto + Research on the left, Blog + a
gradient "Meet Aristotle" CTA on the right. Footer is a 5-column grid (Learn more / About us /
Get started / Legal) over a giant masked wordmark.

### 1.3 Page-level content model

| Page | Structural pattern |
|---|---|
| Home | hero (text left, illustration right) → logo marquee → two-line differentiator → testimonial carousel (5 pages of cards) → 5 method cards with citations → founder mission essay → 2 blog cards |
| Research | headline → foundation claim → 2 evidence studies → ChatGPT-vs-Aristotle table → 5 numbered principles, each with paper citations → 4 evaluation benchmarks → CTA |
| Subjects | headline → categories (Math / Science / Test Prep / College) → cards with `N skills mapped` |
| Pricing | 3 plan cards (middle-priced not featured; the $199 "Infinite" is "Best value") → human-tutor comparison → 6 FAQs |
| Testimonials | 18 quotes with name, relationship, city |

### 1.4 Design system (extracted from the shipped CSS)

The site ships CSS Modules on top of a hand-rolled token layer. Tokens recovered verbatim:

```
core   #fff #fdfdf7 #f9f4e8 #e9ddc8 #d4c5a8 #b5a389 #96816a #5d463a #3d2c22 #1e140f
fuji   #ffe1d4 #ffae97 #ff7362 #f25259 #d42b44 #7b2428 #5a1a1d      (accent = oxblood #7b2428)
fruit  blue #85c4e9 · lemon #f1e47a · lime #8ec777 · berry #ed83c0 · apricot #fd984a
type   display "Recoleta", Georgia, serif · sans "Host Grotesk", system-ui
scale  display clamp(3rem,5vw,4rem) · h1 clamp(2.25rem,3vw,3rem) · h2 clamp(1.75rem,2vw,2.25rem)
       h3 1.25rem · lead 1.25rem · body 1.125rem · small .9375rem · eyebrow .875rem/.14em
rhythm space 1..32 (0.25rem base) · section-y-lg clamp(5rem,8vw,7rem)
shape  radius sm .25 / md .5 / lg .75 / xl 1rem / pill · shadow sm-md-lg on #18202a
```

Semantic layer maps `surface / surface-alt / text / text-secondary / action / border` onto those
palettes, and the `.accent` section variant **reassigns the semantic variables** so an oxblood
band inverts every child component without per-component overrides. That is the single
smartest thing in their stylesheet, and it is reproduced here.

**Texture and motif.** Three devices carry the whole "school stationery" identity:

1. `graph-paper.svg` — a 15px grid stroked `rgba(133,196,233,.23)`, tiled at 30px, on alternating sections.
2. A **torn-paper mask** (`torn-paper-edge.png`, `mask-repeat: repeat-x`) on the top and bottom of cream sections, with a drop-shadow so the paper appears to lift off the page.
3. Sticker illustrations (pencil, heart, marks), tape strips on testimonial cards, and a clickable apple in the footer.

**Signature interactions.** The primary button draws a **dashed border in a circle on hover**
via an `@property --border-draw` angle animating a conic-gradient mask. The ghost button reveals
a hand-drawn squiggle underline (an inline SVG mask, `clip-path` wiped left to right).
Testimonial quotes gain a dashed underline on card hover.

### 1.5 Tech stack of the original (evidence)

| Layer | Finding | Evidence |
|---|---|---|
| Framework | Next.js App Router, RSC | `vary: rsc, next-router-state-tree`, `/_next/static/chunks/*` |
| Rendering | Static prerender + ISR | `x-nextjs-prerender: 1`, `x-nextjs-stale-time: 300` |
| Host/CDN | Vercel, edge cached | `server: Vercel`, `x-vercel-cache: HIT`, `x-vercel-id: bom1::…` |
| Styling | CSS Modules + CSS custom properties | class names `Hero-module__qSvJ-q__hero` |
| Images | `next/image` with 1x/2x srcsets | `/_next/image?url=…&w=256&q=75` |
| Fonts | self-hosted Recoleta (woff2) + Host Grotesk (variable ttf) | `<link rel=preload as=font>` |
| Consent | iubenda | `iubenda-cs-preferences-link` in the footer |
| Payload | ~230 KB HTML on `/` (RSC payload inline) + 5 CSS chunks (~114 KB) + ~8 JS chunks | measured |

**Read on that stack.** It is a marketing site with no logged-in surface (the app lives behind
`/go/*`), so nearly all of the React that ships is unused at runtime. They are paying ~350 KB of
framework and stylesheet for content that is 100% static. The choice is defensible for a funded
team (one language for site + app, Vercel previews, easy A/B tests) but it is not the *minimum*
stack, which is what this replica was asked to find.

---

## 2. Product requirements document

### 2.1 Problem

Parents evaluating an AI tutor arrive sceptical: they have already watched a chatbot do their
child's homework for them. The site must, within one scroll, answer *is this different from
ChatGPT*, *does it work*, *what does it cost*, and *is my child safe*.

### 2.2 Goals

| # | Goal | Measure |
|---|---|---|
| G1 | Convert parent visitors to onboarding | click-through to `/go/onboard` |
| G2 | Establish credibility before price is seen | scroll depth past the method section |
| G3 | Make the "we teach, not answer" distinction unmissable | the differentiator band is the third thing on the page |
| G4 | Load and read instantly on a phone on mobile data | LCP < 1.5s on 4G, < 60 KB critical path |
| G5 | Be fully usable without JavaScript and with a screen reader | every page renders and navigates with JS off |

### 2.3 Non-goals

The tutoring product itself; accounts, auth, payments; a CMS; i18n; analytics; A/B testing;
dark mode (the source has none — it commits to a single paper-cream look).

### 2.4 Personas

- **Parent (primary).** Time-poor, price-sensitive, worried about screen time and cheating. Reads the differentiator, the testimonials and the price. Skims the method page but is reassured it exists.
- **Student (secondary).** Arrives from a friend. Reads testimonials from other students, wants to know if it is annoying.
- **Teacher / partner school (tertiary).** Reads the method page properly and checks whether the citations are real.

### 2.5 User stories and acceptance criteria

| ID | Story | Acceptance criteria |
|---|---|---|
| US-1 | As a parent I see what this is within one screen | Hero states product + audience above the fold at 390px and 1280px; two CTAs present |
| US-2 | As a parent I see other families trust it | Logo marquee immediately below hero; animation pauses on hover; text is in the accessibility tree once, not twice |
| US-3 | As a parent I understand the difference from a chatbot | Two-line differentiator band; a comparison table on the method page |
| US-4 | As a parent I read proof | ≥9 testimonials on home in a paged carousel; ≥18 on the wall page; each has name, relationship, location |
| US-5 | As a parent I understand the method | 5 method cards, each with a claim, a mechanism and a citation, linking to a deeper page |
| US-6 | As a parent I can compare price to a human tutor | 3 plans; one marked best value; 5-row comparison table; 6 FAQs as native `<details>` |
| US-7 | As a visitor I can find every secondary page | Footer exposes 11 links; zero broken internal links |
| US-8 | As a keyboard/screen-reader user I can use everything | Skip link; visible focus rings; carousel dots are real buttons with `aria-selected`; decorative art is `aria-hidden` |
| US-9 | As a visitor on a slow connection I get content fast | No web fonts, no external requests, ≤ 30 KB HTML and ≤ 30 KB CSS per page |
| US-10 | As a visitor with JS disabled I lose nothing essential | Carousels remain horizontally scrollable; nav collapses to a still-reachable menu; forms state they are inert |

### 2.6 Functional requirements by page

- **Home** — hero, marquee, differentiator, testimonial carousel + link, 5 method cards + link, mission essay, 2 blog cards.
- **/books** — 5 categories, 18 titles, each with a skills count and a one-line blurb; closing CTA on a torn-paper band.
- **/pricing** — 3 plans (Pickwick free / Copperfield $49 / Great Expectations $199, featured), comparison table, FAQ, oxblood CTA band.
- **/method** — foundation, 2 evidence cards, contrast table, 5 numbered principles, 4 evaluation measures, CTA.
- **/testimonials** — 18-quote masonry wall.
- **/blog + 2 posts** — index cards and long-form reading layout capped at 62ch.
- **/go/onboard, /go/signin** — inert demo forms that never submit and say so.
- **/careers, /fellows, /fellowship, /privacy, /terms, /404** — real pages so no footer link dead-ends.

### 2.7 Content requirements

All copy is dummy content derived from Dickens. Quotations are verbatim Dickens; characters are
used as fictional customers; every "citation" points at a novel and chapter rather than a paper,
so no reader can mistake this for a research claim. Two pages state in body copy that the site is
a demonstration and stores nothing.

### 2.8 Success criteria for *this* build

Delivered and verified: 16 routes, 0 broken internal links, 0 missing assets, 0 console errors,
224 KB total build output, 40 ms full rebuild, zero runtime dependencies, zero third-party requests.

---

## 3. Technical architecture

### 3.1 Shape

```
data (.mjs objects)  ──►  page modules  ──►  ui primitives  ──►  HTML string  ──►  dist/**/index.html
                                    │
public/ (css, js, svg) ─────────────┴───────────────────────────────────────────►  dist/
```

A build script imports every module in `src/pages/`, calls `render()` on each exported page
descriptor, and writes `dist/<path>/index.html`. `public/` is copied verbatim. That is the whole
pipeline — 30 lines, no plugins, no config file, no lockfile.

```
build.mjs            discover pages, render, write, copy assets
serve.mjs            dev/static server with directory-index and 404 fallback
src/lib/ui.mjs       page shell, header, footer, section/heading/text/button/card/tornEdge
src/lib/icons.mjs    inline SVG icon set + the hero illustration
src/data/*.mjs       content, one module per page area
src/pages/*.mjs      page descriptors: { path, title, description, render() }
public/styles/app.css   one stylesheet, 14 numbered sections
public/scripts/app.js   ~105 lines of progressive enhancement
public/textures, public/brand   graph paper, torn edge, inkwell logo
```

### 3.2 Rendering model

Everything is rendered **once, at build time**, into plain HTML. There is no hydration, no
client-side router, no runtime templating. A page is a function from data to a string; the only
"framework" concepts are composition and escaping (`esc()` is applied at every interpolation
of author-supplied text).

**Why not partial hydration / islands?** There is nothing to hydrate. The three interactive
behaviours (menu, carousel dots, inert forms) are DOM-level and total 3.5 KB of vanilla JS.

### 3.3 Routing and URLs

Page descriptors carry a `path`; the builder writes `dist/<path>/index.html`, so URLs are
extensionless and directory-shaped (`/pricing`, `/blog/<slug>`) exactly as on the source site.
`serve.mjs` resolves `/x` → `dist/x/index.html` → `dist/x.html` → `dist/404/index.html` with a
404 status, which mirrors what Vercel/Netlify/S3+CloudFront do in production.

### 3.4 CSS architecture

One stylesheet, 25 KB, in a fixed order: **tokens → reset → text primitives → layout →
buttons → chrome → components → page blocks → responsive → motion**. Rules are flat and
class-based; specificity never exceeds `0,2,0`; no preprocessor, no build step, no purge step.

Three inherited ideas from the source, reimplemented:

- **Semantic re-mapping in `.section.accent`** — one class inverts a whole band.
- **Textures as masks, not images** — the torn edge is an SVG mask over a background colour, so it recolours with the section instead of needing a new asset per background.
- **`@property --border-draw`** — the animated dashed border on primary buttons, with a plain static border as the natural fallback in browsers without registered custom properties.

Responsive strategy is fluid-first: `clamp()` type, `auto-fit` grids, and only four breakpoints
(640 / 768 / 899 / 900) where layout genuinely changes.

### 3.5 JavaScript budget

| Behaviour | Cost | Without JS |
|---|---|---|
| Mobile menu toggle | ~15 lines | Menu markup is present; the toggle is the only loss |
| Carousel pagination dots | ~55 lines | Track is still a native horizontal scroller with snap points |
| Inert demo forms | ~8 lines | Form does nothing; a note already says nothing is submitted |
| Footer inkwell easter egg | ~8 lines | Nothing lost |

No polyfills, no bundler, no module graph. The file is a single IIFE served with `defer`.

### 3.6 Accessibility

Skip link; one `<h1>` per page; landmark elements (`header`/`nav`/`main`/`footer`); `aria-expanded`
on the menu toggle; carousel dots are `<button role="tab">` with `aria-selected` and per-dot
labels; the marquee is `aria-hidden` with a visually-hidden real list behind it so the school
names are announced once; decorative SVG is `aria-hidden`; `prefers-reduced-motion` disables the
marquee, smooth scrolling and all transitions; focus rings are never removed.

### 3.7 Performance

No web fonts (system serif/sans stacks), no external hosts, no analytics, no cookies. Critical
path per page is one HTML document (4–24 KB) + one CSS file (25 KB) + one deferred JS file
(3.5 KB). The hero is inline SVG, so the LCP element needs no network round trip.

### 3.8 Security and privacy posture

Nothing is collected: no forms post anywhere, no cookies are set, no third-party script loads.
The demo forms `preventDefault()` and say so in the UI, in `/privacy` and in `/terms`. All
interpolation is escaped at the primitive level rather than at call sites.

### 3.9 When this architecture should be abandoned

It is the right choice while the site is static marketing content maintained by people who can
edit a JS object. Graduate to Astro (content collections, MDX, image optimisation) when
non-engineers need to publish posts; graduate to Next.js when the marketing site and the
logged-in app must share components, auth or personalisation — which is exactly the position the
original is in.

---

## 4. Tech stack and decision log

### 4.1 Stack

| Layer | Choice | Runtime dependencies |
|---|---|---|
| Build | Node ≥ 18, one script, ESM | none |
| Templating | Tagged template literals in `.mjs` | none |
| Styling | One hand-written CSS file with custom properties | none |
| Interactivity | ~105 lines of vanilla JS | none |
| Fonts | System serif + system sans stacks | none |
| Images | Inline SVG, authored here | none |
| Dev server | `serve.mjs`, `node:http` | none |
| Deploy target | Any static host | none |

`package.json` has **no `dependencies` and no `devDependencies`**, therefore no lockfile, no
`node_modules`, no supply chain, and no upgrade treadmill.

### 4.2 Decisions

Each entry: what was chosen, why, how it is implemented, what it costs, and what would reverse it.

**D1 — Static HTML generated by a Node script, not Next.js.**
*Why.* The brief said "only necessary tech stack". The source ships React + RSC for pages with
three interactive widgets and no authenticated surface; the framework is carrying no weight.
*How.* `build.mjs` imports page modules and writes files. *Cost.* No file-based routing, no
image pipeline, no MDX. *Reverse it when.* The marketing site needs to share components with the
logged-in app, or content editors need a CMS.

**D2 — A build step at all, rather than 16 hand-written HTML files.**
*Why.* Header, footer and section chrome appear on every page; duplicating them 16 times
guarantees drift. *How.* Shared `ui.mjs` primitives. *Cost.* You must run `npm run build`.
*Reverse it when.* Never; this is the cheapest possible abstraction that still removes duplication.

**D3 — Plain CSS with custom properties, not Tailwind.**
*Why.* The source's design system is already expressed as CSS variables, and its signature
effects (conic-gradient border draw, torn-paper masks, squiggle underline masks) are custom CSS
that Tailwind would only wrap. A utility framework would also add a build step and a purge step
to save nothing at this size. *How.* One ~650-line stylesheet in a fixed cascade order.
*Cost.* Class names must be kept disciplined by hand. *Reverse it when.* More than ~5 engineers
touch the CSS simultaneously.

**D4 — System font stacks instead of Recoleta and Host Grotesk.**
*Why.* Recoleta is a commercially licensed font; redistributing its files in a replica would be
a licence violation, and Host Grotesk would still be two more network requests.
*How.* `--font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif`
and a system UI sans. *Cost.* The display face is close in spirit (old-style serif, humanist
warmth) but is not the same typeface, and it varies by platform. *Reverse it when.* A licensed
display face is purchased — swap two variables and add one `@font-face` block.

**D5 — Original SVG artwork instead of copied assets.**
*Why.* The hero photograph/illustration, apple mark, stickers and school logos are the source's
intellectual property. *How.* An inline hero scene, an inkwell logo, a 10-icon set, and school
names rendered as text in the marquee. *Cost.* Less polished than commissioned illustration.

**D6 — Reuse the design tokens verbatim.**
*Why.* The exercise is a replica; colour values, spacing steps and type scales are functional
facts of the layout, and matching them is what makes the reproduction faithful. *How.* Section 1
of `app.css`. *Cost.* None functionally. *Note.* Combined with D4 and D5, the result reads as the
same design language without reusing any protected asset, and the brand is renamed throughout.

**D7 — Rename the product to "Boz".**
*Why.* Dickens's own pen name — it keeps the "single historical figure" naming pattern of the
original while making it unmistakable that this is a demonstration and not a clone trading on
someone's brand. *How.* One field in `site.mjs`; every page reads from it.

**D8 — Subjects become books; plans become novels.**
*Why.* The dummy content had to come from Dickens, and a reading tutor is the honest way to make
Dickens the *subject matter* rather than random filler. Skill-map counts, category grouping and
plan tiering keep the original's structure intact. *How.* `books.mjs`, `pricing.mjs`.

**D9 — Carousels are native scroll-snap tracks with JS-generated dots.**
*Why.* The source uses paged carousels on home; a scroll-snap track gives the same interaction
with zero JS for the scrolling itself and degrades to a swipeable list.
*How.* `.carousel-track { scroll-snap-type: x mandatory }`; `app.js` computes page count from
track width and renders `role="tab"` buttons. *Cost.* Dots disappear without JS (acceptable —
the content is still reachable).

**D10 — Real pages for every footer link, including legal.**
*Why.* A replica with eight dead links is not a replica. It also gives somewhere to state the
demonstration status. *How.* `misc.mjs` generates them from a small helper.

**D11 — Forms are inert by design and say so.**
*Why.* There is no backend, and a form that silently pretends to work is a dark pattern.
*How.* `data-demo-form` + `preventDefault()` + a visible note and an `aria-live` status.

**D12 — No analytics, cookies, or consent banner.**
*Why.* The source loads iubenda because it tracks; this build tracks nothing, so a consent
banner would be theatre. Documented in `/privacy`.

**D13 — Ship a dev server in the repo.**
*Why.* `file://` breaks absolute asset paths and directory-index URLs, so opening `dist/index.html`
directly would misrepresent the build. `serve.mjs` reproduces production URL semantics in 45 lines
with no dependency.

---

## 5. Content mapping and IP position

| Source element | Replica |
|---|---|
| Aristotle (brand) | **Boz** — Dickens's pen name |
| "The tutor who can ace every subject" | "The tutor who has read every book" |
| Apple logo mark | Inkwell + quill (original SVG) |
| 20 real school logos | 16 fictional institutions (Salem House, Dotheboys Hall, Marshalsea Institute…), set in type |
| 17 subjects with skill counts | 18 Dickens novels with skill counts, in 5 categories |
| Intro / Scholar / Infinite | **Pickwick** (free) / **Copperfield** ($49) / **Great Expectations** ($199) |
| Parent and student testimonials | Verbatim Dickens lines attributed to characters as customers |
| arXiv/Nature citations | Chapter citations ("Hard Times, Book I, Ch. 2") — deliberately never a fake paper |
| Founder mission by a named cofounder | Mission signed "Wilkins Micawber, Cofounder" |
| 2 blog posts | 2 Dickens-themed essays written for this build |

**IP position.** Dickens's works entered the public domain long ago, so the quotations are free
to use. No text, image, font file, logo or CSS file from heyaristotle.com is redistributed here;
the design tokens (colour values, spacing steps, type scale) and layout patterns were measured
and re-implemented from scratch, and every brand-identifying element is replaced. The build states
its demonstration status on `/privacy`, `/terms` and both forms. This is a study replica, not a
deployable competitor, and should not be published under a name or branding that could be
confused with the original.

---

## 6. Verification

| Check | Method | Result |
|---|---|---|
| Build | `node build.mjs` | 16 pages, 40 ms, 224 KB output |
| Internal links | script: every `href`/`src` starting `/` resolved against built routes and assets | **0 broken links, 0 missing assets** |
| CSS coverage | every class used in HTML checked against the stylesheet | only intentional hooks (`page-*`) unstyled |
| Console | browser console, all pages loaded | **no errors, no warnings** |
| Desktop rendering | 1280×2400 screenshot of `/`, `/pricing`, `/method`, `/testimonials` | hero, marquee, torn edges, tape, carousel dots, tables all correct |
| Mobile rendering | 390×1600 screenshot of `/books` | hamburger, single-column grid, readable type |
| Server semantics | `curl` on `/`, `/pricing`, `/styles/app.css`, `/nope` | 200, 200, 200, **404** |
| Reduced motion | `prefers-reduced-motion` block | marquee and transitions disabled |

Not verified: cross-browser behaviour outside the Chromium build used here (`@property` and
`mask` have Safari/Firefox support but the animated border falls back to a static dashed border
where `@property` is missing), and no automated a11y audit (axe/Lighthouse) was run.

---

## 7. Running, extending, deploying

```bash
npm run dev     # build, then serve on http://localhost:4321
```

```bash
npm run build   # write dist/
```

```bash
npm run audit   # build, then fail on dead links, heading skips, or unlabelled controls
```

Requires Node 18+. There is nothing to install.

**Add a page.** Create `src/pages/thing.mjs` exporting a default array of
`{ path, title, description, render() }`; the builder discovers it automatically.

**Edit content.** Everything user-visible is in `src/data/`. No HTML editing required for copy
changes.

**Restyle.** Change the tokens in section 1 of `public/styles/app.css`; the whole site follows.

**Live deployment.** https://utsav23.com/demofiles2/ — GitHub Actions builds on every push to `main`, runs
`audit.mjs`, and only publishes if the audit passes. Base path and origin come from
`actions/configure-pages`, so the same source builds correctly at a domain root, a
`github.io` project path, or the custom domain in use here.

**Deploy elsewhere.** Upload `dist/` anywhere — Netlify, Vercel, GitHub Pages, S3 + CloudFront, nginx.
Configure the host's 404 page to `404/index.html`. No build image, no runtime, no environment
variables.


---

## 8. Second iteration (12 August 2026)

The build was extended after review. `TECH_NOTES.txt` is the full engineering
write-up of this work — stack, code walkthrough, and every trade-off. Summary of what
changed:

**Waitlist capture.** `/go/onboard` and `/go/signin` now capture what the visitor types,
store it in `localStorage` under `boz.waitlist.v1`, and show a confirmation panel with the
submitted details, a queue position and a reference code derived from a stable hash of the
email, plus edit / copy / delete actions. The entry survives a reload. Sign-in cross-references
the saved entry. Storage failure is handled and disclosed rather than hidden. Rationale and the
rejected alternatives are decisions D11–D14 in `TECH_NOTES.txt`.

**Legal pages.** `/privacy` and `/terms` were rebuilt as production-structure documents — 14
and 18 sections respectively, with a cookie and storage table, processor table, retention by
category, EEA/UK and California supplements, AI training disclosures, and a children's section
that leads on parental consent and data minimisation, since the end users would be minors. Both
render from a block grammar in `src/data/legal.mjs`, with a generated table of contents and a
scroll-linked contents rail. A demonstration notice at the top of each keeps them truthful.

**Accessibility.** Connected labels, `aria-describedby` error wiring, `role="alert"` messages,
focus management on submit, a polite live region, WCAG 2.2 target sizes, keyboard paging for
carousels, Escape-to-close on the menu with focus restoration, and no skipped heading levels.
The primary button gradient was darkened because the original's coral measured 2.6:1 against
white text — the one place where fidelity to the source was knowingly traded away.

**Motion.** Scroll reveals via `IntersectionObserver`, with the hidden state applied only after
JS confirms support, content already on screen exempted from animation, and the whole feature
skipped under `prefers-reduced-motion`.

**Tooling.** `audit.mjs` (`npm run audit`) checks link integrity, heading order, form labelling,
alt text, duplicate ids and page metadata across `dist/`, and exits non-zero on any violation.

**Cookie consent.** The OneTrust stub is emitted from the `page()` shell in `src/lib/ui.mjs`,
in `<head>` before `<title>`, so one edit covers all 16 routes. It is gated on an
`ONETRUST_DOMAIN_ID` build variable: unset, nothing renders and the privacy page keeps its
"no cookies at all" statement; set, the script, a footer *Cookie preferences* button, and the
corresponding privacy-page cookie and processor entries all switch on together, because the
legal copy branches on the same flag. `audit.mjs` fails the build if a page loses the stub,
loads it after `<title>`, or has no preferences control. See `TECH_NOTES.txt` §13.

**Bugs found and fixed during QA.** A double-escaped form label; a grid column inflated past the
viewport on `/privacy` at 375px by a wide table (`min-width: auto` on grid children); four
controls below the 24px minimum target size; the button contrast failure above.
