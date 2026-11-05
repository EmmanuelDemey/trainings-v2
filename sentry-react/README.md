# Sentry for React

The material of the **Sentry for React** training (one day): a slide deck, hands-on
workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
training.config.mjs
```

## One training of two

The same day exists for **React** (this folder) and **NestJS**
([`../sentry-nestjs`](../sentry-nestjs)): the web app and the API of the same issue
tracker. What the two have in common is written once, in
[`../sentry-common`](../sentry-common):

| Shared, in `../sentry-common/` | How this training gets it |
|---|---|
| The concepts — events and issues, scopes, enrichment, grouping, PII, releases, source maps, tracing, sampling, operating Sentry — as slide fragments, `slides/<NN>_<chapter>/*.md` | each chapter of `slides/` imports them with Slidev's `src:` |
| The end-of-day retro, `slides/retro.md` | imported at the end of chapter 06 |
| The test kit — a fake transport that records every envelope, `testkit/sentryTestkit.ts` | **copied** to `src/tests/shared/` of every workshop and solution |

What this folder owns is React: the SDK slides (`ErrorBoundary`,
`reactErrorHandler`, `@sentry/vite-plugin`, `browserTracingIntegration`, Session
Replay, User Feedback…), the workshop code and its specs, the fake backend
`src/api/fakeServer.ts` of each workshop, and the workshop READMEs.

The contract between the two trainings — the chapters, the fragments each chapter
imports, the schedule, and for every workshop its test ids, its bugs and its
steps — is [`../sentry-common/CURRICULUM.md`](../sentry-common/CURRICULUM.md).
Change it there first.

### The sync

The copies in `src/tests/shared/` are **gitignored**: the single source stays in
`sentry-common/`. They exist on disk because each workshop must stand alone — its
ZIP and its online editor only see the workshop folder.

```bash
pnpm run sync      # rewrites every copy, in every workshop and solution
```

You rarely need to run it yourself: `pnpm install` runs it (`postinstall`), and so
do `pnpm run build` and the CI. Run it after a change in `sentry-common/testkit/`,
or after cloning if you only `npm install` inside one workshop.

## Write

```bash
pnpm install        # also syncs the test kit into the workshops
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
```

**The number at the start of a name is its place.** `slides/03_….md` is chapter 3,
`workshops/03_…/` is workshop 3. A name that starts with `_` is turned off — kept
on disk, left out of the deck, the site, the PDFs and the ZIPs.

## Build

```bash
pnpm run build          # sync, then everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads are named after the slug: `sentry-react-slides.pdf`,
`sentry-react-workshops.pdf`, `sentry-react-solutions.zip`,
`sentry-react-participants.zip`, plus a starter and a solution ZIP per workshop
under `downloads/tp/`.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder or `sentry-common/` deploys it, and a pull request
gets a preview. [`netlify.toml`](netlify.toml) only carries the headers.

## Checking the workshops

Each workshop is its own npm project. The CI syncs the test kit, installs each
workshop, and checks that the solution passes its specs, typechecks and builds, and
that the starter typechecks but does not pass:
[`check-workshops.mjs`](../scripts/check-workshops.mjs), configured by
[`workshops.ci.mjs`](workshops.ci.mjs).

```bash
node ../scripts/check-workshops.mjs .    # from this folder: what the CI runs
```
