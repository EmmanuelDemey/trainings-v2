# React Query

The material of the **React Query** training (TanStack Query for React, one day):
a slide deck, hands-on workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
training.config.mjs
```

## One training of three

The same day exists for **React** (this folder), **Angular**
([`../tanstack-query-angular`](../tanstack-query-angular)) and **Vue**
([`../tanstack-query-vue`](../tanstack-query-vue)). What the three have in common
is written once, in [`../tanstack-query-common`](../tanstack-query-common):

| Shared, in `../tanstack-query-common/` | How this training gets it |
|---|---|
| The concepts — keys, `staleTime` / `gcTime`, mutations, optimistic updates, internals… — as slide fragments, `slides/<NN>_<chapter>/*.md` | each chapter of `slides/` imports them with Slidev's `src:` |
| The end-of-day retro, `slides/retro.md` | imported at the end of chapter 08 |
| The fake API and the Network panel, `api/*.ts` | **copied** to `src/api/` of every workshop and solution |
| The workshop specs (Testing Library, no framework), `specs/<NN>_*.spec.ts` | **copied** to `src/tests/shared/workshop.spec.ts` of the workshop with the same number |

What this folder owns is React: the adapter slides (`QueryClientProvider`,
`useQuery`, `useMutation`, Suspense, `renderHook`…), the workshop code, the
test helper `src/tests/render.tsx` that renders the app for the shared specs,
and the workshop READMEs.

The contract between the three trainings — the chapters, the fragments each
chapter imports, the schedule, and for every workshop its test ids, its starter
bugs and its steps — is
[`../tanstack-query-common/CURRICULUM.md`](../tanstack-query-common/CURRICULUM.md).
Change it there first.

### The sync

The copies in `src/api/` and `src/tests/shared/` are **gitignored**: the single
source stays in `tanstack-query-common/`. They exist on disk because each
workshop must stand alone — its ZIP and its online editor only see the workshop
folder.

```bash
pnpm run sync      # rewrites every copy, in every workshop and solution
```

You rarely need to run it yourself: `pnpm install` runs it (`postinstall`), and so
do `pnpm run build` and the CI. Run it after a change in `tanstack-query-common/`,
or after cloning if you only `npm install` inside one workshop.

## Write

```bash
pnpm install        # also syncs the shared API and specs into the workshops
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
pnpm run build          # sync, then everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads are named after the slug: `tanstack-query-react-slides.pdf`,
`tanstack-query-react-workshops.pdf`, `tanstack-query-react-solutions.zip`,
`tanstack-query-react-participants.zip`, plus a starter and a solution ZIP per
workshop under `downloads/tp/`.

Each workshop page also opens the workshop in an online editor (StackBlitz,
`playground` in [`training.config.mjs`](training.config.mjs)): no clone, no
install on the learner's machine.

The PDF exports print with Chromium. To use one already on the machine instead
of downloading Playwright's, set `TRAINING_KIT_CHROME` to its path.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder or `tanstack-query-common/` deploys it, and a pull request gets
a preview. Nothing to set up in the Netlify UI — the site is created on its first
deploy. [`netlify.toml`](netlify.toml) only carries the headers.

## Checking the workshops

Each workshop is its own npm project. The CI syncs the shared files, installs
each workshop, and checks that the solution passes its spec and that the starter
does not:
[`workshops.yml`](../.github/workflows/workshops.yml), configured by [`workshops.ci.mjs`](workshops.ci.mjs).
