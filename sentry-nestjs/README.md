# Sentry for NestJS

The material of the **Sentry for NestJS** training (one day): a slide deck,
hands-on workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
training.config.mjs
```

## One training of two

The same day exists for the **browser** — Sentry for React
([`../sentry-react`](../sentry-react)) — and for the **API** (this folder). Both
instrument the same product, an issue tracker. What the two have in common is
written once, in [`../sentry-common`](../sentry-common):

| Shared, in `../sentry-common/` | How this training gets it |
|---|---|
| The concepts — events and issues, scopes, grouping, PII, releases, source maps, sampling, distributed tracing, logs, operating Sentry — as slide fragments, `slides/<NN>_<chapter>/*.md` | each chapter of `slides/` imports them with Slidev's `src:` |
| The end-of-day retro, `slides/retro.md` | imported at the end of chapter 06 |
| The test kit — a fake transport that records the envelopes, `testkit/sentryTestkit.ts` | **copied** to `src/tests/shared/` of every workshop and solution |

What this folder owns is NestJS: the SDK slides (`instrument.ts` and `--import`,
`SentryModule`, the exception filters, the isolation scope per request,
`@SentryTraced`, `@SentryCron`, profiling, shutdown…), the workshop code, their
specs, and the workshop READMEs.

The contract between the two trainings — the chapters, the fragments each chapter
imports, the schedule, and for every workshop its steps and its specs — is
[`../sentry-common/CURRICULUM.md`](../sentry-common/CURRICULUM.md). Change it
there first.

### The sync

The copies in `src/tests/shared/` are **gitignored**: the single source stays in
`sentry-common/`. They exist on disk because each workshop must stand alone — its
ZIP and its online editor only see the workshop folder.

```bash
pnpm run sync      # rewrites every copy, in every workshop and solution
```

`pnpm install` runs it (`postinstall`), and so do `pnpm run build` and the CI.

## Write

```bash
pnpm install        # also syncs the test kit into the workshops
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
```

**The number at the start of a name is its place.** `slides/03_….md` is chapter 3,
`workshops/03_…/` is workshop 3. A name that starts with `_` is turned off.

## Build

```bash
pnpm run build          # sync, then everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
```

The downloads are named after the slug: `sentry-nestjs-slides.pdf`,
`sentry-nestjs-workshops.pdf`, `sentry-nestjs-solutions.zip`,
`sentry-nestjs-participants.zip`, plus a starter and a solution ZIP per workshop.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder or `sentry-common/` deploys it.

## Checking the workshops

Each workshop is its own npm project. The CI syncs the test kit, installs each
workshop, and checks that the solution passes its specs, typechecks and builds,
and that the starter typechecks but does not pass:
[`check-workshops.mjs`](../scripts/check-workshops.mjs), configured by
[`workshops.ci.mjs`](workshops.ci.mjs).
