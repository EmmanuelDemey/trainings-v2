# trainings-v2

The material for the trainings: **slide decks** (Slidev) and **hands-on
workshops** (plain folders, one per exercise), plus the site that publishes them.

```
training/            the decks and the workshops
  chapters/<training>/tp/     one folder per workshop — this is where learners work
  solutions/<training>/       the worked answers, deliberately not published
site/                the workshops site (Astro + Starlight)
scripts/             the build that assembles everything
```

## Build everything

```bash
node scripts/build-all.mjs      # or: npm run build
npx serve build                 # preview
```

It produces a single deployable folder:

```
build/
  index.html          the workshops site
  javascript/         its workshop pages
  vuejs-advanced/
  slides/
    javascript/       the Slidev deck
    vuejs-advanced/
  _redirects          SPA fallback, one rule per deck
```

The site is at the root, the decks under `/slides/<training>/`. Partial builds:
`--only site`, `--only slides`.

## Adding a training to the site

One entry in [`scripts/trainings.mjs`](scripts/trainings.mjs) — it drives both the
workshop pages and the deck build — and one group in the `sidebar` of
[`site/astro.config.mjs`](site/astro.config.mjs).

Only **JavaScript** and **Advanced Vue.js** are published for now. The other decks
under `training/` are still built one at a time with `npm run dev -- <deck>.md`.

## Deploying

Netlify, from the repository root: see [`netlify.toml`](netlify.toml).
`training/netlify.toml` is a leftover of an older setup and only applies if the
Netlify *base directory* is set to `training` — it must be left empty.
