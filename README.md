# trainings-v2

The material for the trainings: **slide decks** (Slidev) and **hands-on
workshops** (plain folders, one per exercise), plus the site that publishes them.

```
training/            the decks and the workshops
  chapters/<training>/tp/     one folder per workshop — this is where learners work
  solutions/<training>/       the worked answers, published as a ZIP
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
  downloads/                    all linked from the training's Resources page
    javascript-slides.pdf       the deck, exported
    javascript-workshops.pdf    the TPs, as one printable handbook
    javascript-solutions.zip    the worked answers
  _redirects          SPA fallback, one rule per deck
```

The site is at the root, the decks under `/slides/<training>/`. Partial builds:
`--only site`, `--only slides`, and `--no-pdf` to skip the slow PDF export.

Both PDF exports — the deck via Slidev, and the workshop handbook via
[`training/scripts/workshops-pdf.mjs`](training/scripts/workshops-pdf.mjs) —
drive a real browser. On CI it downloads one; locally, point `SLIDEV_CHROME` at a
Chrome you already have:

```bash
SLIDEV_CHROME=~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome npm run build
```

Both are **non-fatal**: a deck that fails to export simply loses its PDF link on
the Resources page.

## Adding a training to the site

One entry in [`scripts/trainings.mjs`](scripts/trainings.mjs). It is the only
list: the workshop pages, the deck build, the downloads, the sidebar and the
per-training menu all read from it. The only thing left to write by hand is a
card on the home page, [`site/src/content/docs/index.mdx`](site/src/content/docs/index.mdx).

Each training is its own space on the site: inside `/javascript/` the menu shows
the JavaScript workshops and nothing else, with one link back to the picker. That
narrowing lives in
[`site/src/starlightRouteData.js`](site/src/starlightRouteData.js).

Only **JavaScript** and **Advanced Vue.js** are published for now. The other decks
under `training/` are still built one at a time with `npm run dev -- <deck>.md`.

## Deploying

Netlify, from the repository root: see [`netlify.toml`](netlify.toml).
`training/netlify.toml` is a leftover of an older setup and only applies if the
Netlify *base directory* is set to `training` — it must be left empty.
