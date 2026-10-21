# TypeScript

The material of the **TypeScript** training — 2 days: a slide deck, hands-on
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

The downloads are named after the slug: `typescript-slides.pdf`,
`typescript-workshops.pdf`, `typescript-solutions.zip`,
`typescript-participants.zip`, plus a starter and a solution ZIP per workshop
under `downloads/tp/`.

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

## The two days

| Day 1 | Chapter | Hands-on | Day 2 | Chapter | Hands-on |
|---|---|---|---|---|---|
| 9:00 | 0 — Introduction | — | 9:00 | 6 — Utility types | TP 6 |
| 9:20 | 1 — From JavaScript to TypeScript | TP 1 | 10:30 | 7 — Type-level programming | TP 7 |
| 10:30 | 2 — Everyday types | TP 2 | 13:30 | 8 — Decorators | TP 8 |
| 13:30 | 3 — Classes & interfaces | TP 3 | 14:45 | 9 — Modules & declaration files | TP 9 |
| 14:45 | 4 — Unions & narrowing | TP 4 | 16:00 | 10 — Tooling | TP 10 |
| 16:00 | 5 — Generics | TP 5 | 17:15 | Retro | |
| 17:15 | Retro | | | | |

Each chapter's quiz (3 questions) is in the time of its slides. If a day runs
late, the bonus steps of its workshops are the ones to leave for afterwards.

The end-of-day retro is not a chapter: it lives in `slides/shared/retro.md` and
is imported at the end of chapters 5 and 10. Course resources and further
reading are in [`RESSOURCES.md`](RESSOURCES.md).

## Checking the workshops

Each workshop is its own npm project. The CI installs each one, checks that the
solution passes its specs and that the starter does not:
[`check-workshops.mjs`](../scripts/check-workshops.mjs), run by the CI before each deploy and configured by [`workshops.ci.mjs`](workshops.ci.mjs).

`npm test` runs `vitest run --typecheck`: besides the runtime specs
(`tests/*.spec.ts`), Vitest **type checks** the type specs (`tests/*.test-d.ts`,
`expectTypeOf`) through each workshop's `tsconfig.test.json`. They are kept out
of `tsconfig.json`, so a starter still passes `npm run typecheck` while its type
specs are red.
