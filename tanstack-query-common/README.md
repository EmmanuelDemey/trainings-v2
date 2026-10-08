# TanStack Query — what the three trainings share

Not a training: the material that the three one-day TanStack Query trainings have
in common, written once.

| Training | Folder |
|---|---|
| React Query | [`../tanstack-query-react`](../tanstack-query-react) |
| TanStack Query for Angular | [`../tanstack-query-angular`](../tanstack-query-angular) |
| TanStack Query for Vue | [`../tanstack-query-vue`](../tanstack-query-vue) |

```
CURRICULUM.md      the contract: schedule, chapters, fragments, and what every workshop does
slides/            the framework-agnostic slide fragments, one folder per chapter, and the retro
api/               the fake issue tracker and the Network panel — plain TypeScript and DOM
specs/             the workshop specs, written with Testing Library: no framework in them
scripts/sync.mjs   copies api/ and specs/ into every workshop of a training
```

## How a training uses it

**Slides.** A training's chapter (`slides/03_pagination_infinite.md`) imports the
fragments it needs with Slidev's `src:`, between its own slides:

```md
---
src: ../../tanstack-query-common/slides/03_pagination_infinite/infinite.md
---
```

A fragment never shows adapter code (`useQuery`, `injectQuery`…): the slide that
follows it, in the training, does.

**Workshops.** Every workshop must stand alone — its starter ZIP and its online
editor only see the workshop folder — so it cannot import from here. The sync copies
what it needs into it instead:

```
api/*.ts                →  <workshop>/src/api/
specs/<NN>_*.spec.ts    →  <workshop>/src/tests/shared/workshop.spec.ts
```

The copies are **gitignored** and carry a "generated, do not edit" header. A
training's `pnpm install` (postinstall) and `pnpm run build` run the sync; so do the
three CI workflows, before testing a workshop. After editing a file here:

```bash
cd ../tanstack-query-react && pnpm run sync     # or: node tanstack-query-common/scripts/sync.mjs tanstack-query-*
```

The specs import `renderApp()` from `../render`: each workshop provides that one
file, the only part of a spec that knows the framework.

## Deploying

Each training is its own Netlify site, built from its own folder. Their
`netlify.toml` rebuild when this folder changes too:
`git diff … -- . ../tanstack-query-common`.
