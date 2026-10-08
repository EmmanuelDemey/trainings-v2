# TanStack Query for Vue

The material of the **TanStack Query for Vue** training (one day): a slide deck,
hands-on workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
training.config.mjs
```

## One programme, three trainings

This training has two siblings, built on the same programme:
[React](../tanstack-query-react) and [Angular](../tanstack-query-angular). What
they share lives **once**, in [`../tanstack-query-common`](../tanstack-query-common),
and [`CURRICULUM.md`](../tanstack-query-common/CURRICULUM.md) is the contract
between them — the chapters, the schedule, and what every workshop must do (its
test ids, its starter's bugs, its steps). Change it there first.

| Shared, in `../tanstack-query-common/` | How this training gets it |
|---|---|
| The concepts: keys, `staleTime`/`gcTime`, mutations, optimistic updates, internals… (`slides/<NN>_<chapter>/*.md`) | each chapter of `slides/` imports its fragments with Slidev's `src:` |
| The end-of-day retro (`slides/retro.md`) | imported at the end of chapter 08 |
| The fake API and the Network panel (`api/`) | **copied** to `src/api/` of every workshop and solution |
| The workshop specs, Testing Library and no framework (`specs/`) | **copied** to `src/tests/shared/workshop.spec.ts`, by workshop number |

What this folder owns is what is Vue: the adapter slides (`VueQueryPlugin`,
`useQuery` with getters, the returned refs, composables, `<Suspense>`, the
router…), the workshop code and READMEs, and `src/tests/render.ts` — the one file
that tells the shared specs how to render a Vue app.

### The sync

Each workshop must stand alone — its starter ZIP and its online editor only
ever see the workshop folder — so the shared API and specs are **copied** into
it, not imported from `../`:

```bash
pnpm run sync     # node ../tanstack-query-common/scripts/sync.mjs
```

The copies are **gitignored** (see [`.gitignore`](.gitignore)) and carry a
"GENERATED — do not edit" banner: edit the original in
`../tanstack-query-common/`, then sync again. You rarely run it by hand:
`pnpm install` runs it (`postinstall`), and so do `pnpm run build` and the CI.

## Write

```bash
pnpm install        # also syncs the API and the specs into every workshop
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
```

**The number at the start of a name is its place.** `slides/03_….md` is
chapter 3, `workshops/03_…/` is workshop 3. A name that starts with `_` is
turned off — kept on disk, left out of the deck, the site, the PDFs and the
ZIPs. There is no list to maintain anywhere else. The number of a workshop
folder is also what the sync uses to pick its shared spec.

## Build

```bash
pnpm run build          # the sync, then everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads are `tanstack-query-vue-slides.pdf`,
`tanstack-query-vue-workshops.pdf`, `tanstack-query-vue-solutions.zip`,
`tanstack-query-vue-participants.zip`, plus a starter and a solution ZIP per
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
each workshop, and checks that the solution passes its spec and typechecks, and
that the starter typechecks and does **not** pass:
[`tanstack-query-vue-workshops.yml`](../.github/workflows/tanstack-query-vue-workshops.yml).
