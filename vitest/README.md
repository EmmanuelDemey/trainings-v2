# Vitest

The material of the **Vitest** training — 1 day: a slide deck, hands-on
workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
training.config.mjs
```

## Write

```bash
pnpm install
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
```

**The number at the start of a name is its place.** `slides/03_….md` is
chapter 3, `workshops/03_…/` is workshop 3. A name that starts with `_` is turned
off — kept on disk, left out of the deck, the site, the PDFs and the ZIPs. There
is no list to maintain anywhere else.

## Build

```bash
pnpm run build          # everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads are named after the slug: `vitest-slides.pdf`,
`vitest-workshops.pdf`, `vitest-solutions.zip`, `vitest-participants.zip`, plus
a starter and a solution ZIP per workshop under `downloads/tp/`.

Each workshop page also opens the workshop in an online editor (StackBlitz,
`playground` in [`training.config.mjs`](training.config.mjs)), started on
`npm run test:watch`: no clone, no install on the learner's machine.

The PDF exports print with Chromium. To use one already on the machine instead
of downloading Playwright's, set `TRAINING_KIT_CHROME` to its path.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder deploys it, and a pull request gets
a preview. Nothing to set up in the Netlify UI — the site is created on its first
deploy. [`netlify.toml`](netlify.toml) only carries the headers.

## The day

| | Chapter | Slides | Hands-on |
|---|---|---|---|
| 9:00 | 0 — Introduction | 20 min | — |
| 9:20 | 1 — Getting started | 30 min | TP 1 — 30 min |
| 10:20 | 2 — Writing tests | 35 min | TP 2 — 40 min |
| 11:35 | 3 — Custom matchers | 20 min | TP 3 — 30 min |
| 13:30 | 4 — Snapshots | 20 min | TP 4 — 25 min |
| 14:15 | 5 — Mocks | 35 min | TP 5 — 45 min |
| 15:35 | 6 — Vue Testing Library | 25 min | TP 6 — 40 min |
| 16:40 | 7 — Advanced | 25 min | TP 7 — 30 min |
| 17:35 | Retro | 10 min | |

Each chapter's quiz (3 questions) is in the time of its slides. The day is
dense: if it runs late, TP 7 and the bonus steps are the ones to leave for
afterwards.

The end-of-day retro is not a chapter: it lives in `slides/shared/retro.md` and
is imported at the end of chapter 7. Course resources and further reading are
in [`RESSOURCES.md`](RESSOURCES.md).

## Checking the workshops

Each workshop is its own npm project. The CI installs each one, checks that the
solution passes its specs and that the starter does not:
[`check-workshops.mjs`](../scripts/check-workshops.mjs), run by the CI before each deploy and configured by [`workshops.ci.mjs`](workshops.ci.mjs).

In workshops 1 to 6 the **learner writes the tests**: the starters ship
`test.todo`s, which assert nothing. They are kept red by the **coverage
thresholds** of each workshop's config — 100 % of `src/`, which only real tests
reach. Workshop 7 ships red specs, the fixtures and config they need left to
write.
