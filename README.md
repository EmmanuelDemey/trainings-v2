# trainings-v2

The material for the trainings: **slide decks** (Slidev) and **hands-on
workshops** (plain folders, one per exercise), plus the site that publishes them.

```
javascript/          the JavaScript training — a training-kit project, its own Netlify site
vuejs-advanced/      the Advanced Vue.js training — a training-kit project, its own Netlify site
tanstack-query-react/     React Query, 1 day — a training-kit project, its own Netlify site
tanstack-query-angular/   TanStack Query for Angular, 1 day — same
tanstack-query-vue/       TanStack Query for Vue, 1 day — same
tanstack-query-common/    what those three share: slide fragments, the fake API, the workshop specs
training/            the other decks and workshops
  chapters/<training>/tp/     one folder per workshop — this is where learners work
  solutions/<training>/       the worked answers, published as a ZIP
site/                the workshops site of the other trainings (Astro + Starlight)
scripts/             the build that assembles it
```

`javascript/`, `vuejs-advanced/` and the three `tanstack-query-*/` trainings are
built by [training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit):
each folder is self-contained (its own `package.json`, lockfile and
`netlify.toml`), and its README says how to write, build and deploy it. The three
TanStack Query trainings also read `tanstack-query-common/`, written once for all
three — its [README](tanstack-query-common/README.md) says how. Everything below
is about the other trainings.

## Build everything

```bash
pnpm install                    # once, at the root
pnpm run build                  # or: node scripts/build-all.mjs
pnpm run preview                # serves build/ as Netlify does
```

It produces a single deployable folder:

```
build/
  index.html          the workshops site
  angular/            its workshop pages
  slides/
    angular/          the Slidev deck
  downloads/                    all linked from the training's Resources page
    angular-slides.pdf          the deck, exported
    angular-workshops.pdf       the TPs, as one printable handbook
    angular-participants.zip    the two PDFs + the workshop folders, no solutions
  _redirects          SPA fallback, one rule per deck
```

The site is at the root, the decks under `/slides/<training>/`. Partial builds:
`--only site`, `--only slides`, and `--no-pdf` to skip the slow PDF export.

Both PDF exports — the deck via Slidev, and the workshop handbook via
[`training/scripts/workshops-pdf.mjs`](training/scripts/workshops-pdf.mjs) —
drive a real browser. On CI it downloads one; locally, point `SLIDEV_CHROME` at a
Chrome you already have:

```bash
SLIDEV_CHROME=~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome pnpm run build
```

Both are **non-fatal**: a deck that fails to export simply loses its PDF link on
the Resources page, and the participant kit ships without it.

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

Each training is its own space on the site: inside `/angular/` the menu shows
the Angular workshops and nothing else, with one link back to the picker. That
narrowing lives in
[`site/src/starlightRouteData.js`](site/src/starlightRouteData.js).

**Angular** is published here. The other decks
under `training/` are still built one at a time with `pnpm run dev <deck>.md`.

`solutions` is optional: the Angular workshops build a single project the learner
creates with `ng new`, so there is nothing to hand out per exercise, and the
Resources page drops the ZIP link on its own.

## Deploying

Three Netlify sites share this repository:

| Site            | Base directory   | Configuration                                                |
| --------------- | ---------------- | ------------------------------------------------------------ |
| JavaScript      | `javascript`     | [`javascript/netlify.toml`](javascript/netlify.toml)         |
| Advanced Vue.js | `vuejs-advanced` | [`vuejs-advanced/netlify.toml`](vuejs-advanced/netlify.toml) |
| The others      | _(empty)_        | [`netlify.toml`](netlify.toml)                               |

Each one skips its deploy when a commit does not touch it.

The rest of this section is about the last one, from the repository root.
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
- **`@netlify/plugin-lighthouse`** audits the home page and the Angular
  overview on the live deploy and posts the scores to the deploy summary. It is
  report-only; `netlify.toml` shows how to turn it into a gate.

Two things are collected through **Netlify Forms**, and both need form detection
enabled for the project in the Netlify UI:

- a **theory quiz** at the top of every workshop page, answered on a correction
  page the form redirects to. Only JavaScript and Advanced Vue.js had questions
  ([`scripts/quizzes/`](scripts/quizzes/)), and training-kit does not publish
  quizzes: since their move, no page of this site carries one.
- an end-of-training **feedback form**, one per training.

Both are described in [`site/README.md`](site/README.md#the-theory-quiz). Mind
the free plan's cap on submissions.
