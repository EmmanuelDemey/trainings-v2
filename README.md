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
  angular/
  slides/
    javascript/       the Slidev deck
    vuejs-advanced/
    angular/
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
per-training menu all read from it. Three things are still written by hand:

- a card (and a hero action) on the home page,
  [`site/src/content/docs/index.mdx`](site/src/content/docs/index.mdx);
- `src/content/docs/<slug>/` in [`site/.gitignore`](site/.gitignore) — those pages
  are generated from the workshop READMEs on every build and must not be committed;
- a Lighthouse audit path in [`netlify.toml`](netlify.toml), if you want the new
  overview scored with the others.

Each training is its own space on the site: inside `/javascript/` the menu shows
the JavaScript workshops and nothing else, with one link back to the picker. That
narrowing lives in
[`site/src/starlightRouteData.js`](site/src/starlightRouteData.js).

**JavaScript**, **Advanced Vue.js** and **Angular** are published. The other decks
under `training/` are still built one at a time with `npm run dev -- <deck>.md`.

`solutions` is optional: the Angular workshops build a single project the learner
creates with `ng new`, so there is nothing to hand out per exercise, and the
Resources page drops the ZIP link on its own.

## Deploying

Netlify, from the repository root: see [`netlify.toml`](netlify.toml).
`training/netlify.toml` is a leftover of an older setup and only applies if the
Netlify *base directory* is set to `training` — it must be left empty.

Two build plugins run on every deploy, both declared in the root
`package.json`:

- **`netlify-plugin-checklinks`** crawls the published site from `index.html`
  and fails the deploy on a broken internal link or a missing asset — a renamed
  workshop, a `/downloads/` file the build did not produce. Roughly 1500 checks
  in a few seconds. External links are not checked, and the hosts the Slidev
  decks pull their fonts from are skipped so a slow third party cannot fail a
  deploy.
- **`@netlify/plugin-lighthouse`** audits the home page and the three training
  overviews on the live deploy and posts the scores to the deploy summary. It is
  report-only; `netlify.toml` shows how to turn it into a gate.

Two things are collected through **Netlify Forms**, and both need form detection
enabled for the project in the Netlify UI:

- a **theory quiz** at the top of every workshop page, answered on a correction
  page the form redirects to. The Vue questions are parsed out of the deck's own
  quiz slides; the JavaScript ones live in [`scripts/quizzes/`](scripts/quizzes/).
- an end-of-training **feedback form**, one per training.

Both are described in [`site/README.md`](site/README.md#the-theory-quiz). Mind
the free plan's cap on submissions: a class of ten going through the eleven
JavaScript workshops is over a hundred of them.
