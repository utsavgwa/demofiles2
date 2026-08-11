# Boz

**Live: https://utsav23.com/demofiles2/** — deployed from `main` by GitHub Actions.

A static replica of the structure and design language of `heyaristotle.com`, rebuilt with the
smallest stack that does the job, using dummy content drawn from the works of Charles Dickens.

- **Zero dependencies.** Node 18+, one build script, one stylesheet, ~105 lines of vanilla JS.
- **16 pages**, generated from data modules into `dist/`.
- **Full write-up** — source analysis, PRD, architecture, and every decision with its reasoning —
  in [DOCUMENTATION.md](DOCUMENTATION.md).

```bash
npm run dev   # build + serve on http://localhost:4321
```

```
build.mjs          discover pages, render, write dist/
serve.mjs          static server with directory-index and 404 fallback
src/data/          all copy (Dickens-derived dummy content)
src/pages/         page descriptors: { path, title, description, render() }
src/lib/           HTML primitives and inline SVG art
public/            stylesheet, script, textures, brand mark
```

This is a demonstration build. It has no backend, sets no cookies, collects nothing, and is not
affiliated with the site it studies. All Dickens quotations are public domain; no asset, font, or
stylesheet from the source site is redistributed here.
