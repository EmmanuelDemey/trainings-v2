# TanStack Query for Angular

The material of the **TanStack Query for Angular** training (one day): a slide
deck, hands-on workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

It has two siblings, built on the same programme with the same workshops:
[React Query](../tanstack-query-react) and [TanStack Query for Vue](../tanstack-query-vue).

```
slides/            one Markdown file per chapter (Slidev) — the Angular adapter
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
training.config.mjs
```

## What lives next door, in `../tanstack-query-common`

Whatever the three trainings have in common is written **once**, in
[`../tanstack-query-common`](../tanstack-query-common), and never copied by hand:

| Shared | Where | How this training gets it |
|---|---|---|
| The concepts (keys, `staleTime` / `gcTime`, mutations, optimistic updates, internals…) and the retro | `slides/<chapter>/*.md` | each chapter of `slides/` imports its fragments with Slidev's `src:` |
| The fake API and the Network panel | `api/fakeApi.ts`, `api/networkPanel.ts` | **the sync** copies them to `src/api/` of every workshop and solution |
| The specs of workshops 01 to 05 | `specs/<NN>_*.spec.ts` | **the sync** copies each one to `src/tests/shared/workshop.spec.ts` |

[`CURRICULUM.md`](../tanstack-query-common/CURRICULUM.md) is the contract between
the three trainings: the chapters, the schedule, and for every workshop its app,
its test ids, the bugs of its starter and its steps. Change it there first.

### The sync

```bash
pnpm run sync        # node ../tanstack-query-common/scripts/sync.mjs
```

The copies it writes are **gitignored**: edit the originals in the shared folder,
then sync again. You rarely run it by hand — `pnpm install` runs it
(`postinstall`), and so do `pnpm run build` and the CI. The copies exist on disk
because each workshop must stand alone: its ZIP and its online editor only ever
see the workshop folder.

Only what is Angular lives here: the adapter's API (`injectQuery`,
`injectMutation`, `provideTanStackQuery`…), the setup, the devtools, the test
helper `src/tests/render.ts`, the workshop code and the READMEs.

## Write

```bash
pnpm install        # also runs the sync
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
```

**The number at the start of a name is its place.** `slides/03_….md` is
chapter 3, `workshops/03_…/` is workshop 3. A name that starts with `_` is
turned off — kept on disk, left out of the deck, the site, the PDFs and the
ZIPs. There is no list to maintain anywhere else. The workshop numbers are also
what the sync matches against the shared specs: `workshops/03_…` gets
`specs/03_…`.

## Build

```bash
pnpm run build          # sync, then everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads are `tanstack-query-angular-slides.pdf`,
`tanstack-query-angular-workshops.pdf`, `tanstack-query-angular-solutions.zip`,
`tanstack-query-angular-participants.zip`, plus a starter and a solution ZIP per
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

Each workshop is its own npm project (an Angular CLI workspace). The CI syncs
the shared files, installs each workshop, and checks that the solution passes
the shared spec, typechecks and builds — and that the starter typechecks but
does **not** pass the spec:
[`check-workshops.mjs`](../scripts/check-workshops.mjs), run by the CI before each deploy and configured by [`workshops.ci.mjs`](workshops.ci.mjs).
