# TanStack Query for Angular — Workshops (TP)

Hands-on exercises for the **TanStack Query for Angular** training, based on
**Angular 22.2**, **`@tanstack/angular-query-experimental` 5.104.1**,
**TypeScript 6.0**, **Vitest 5** (run by `ng test`) and **Testing Library**
(`@testing-library/angular` 19, `@testing-library/dom` 10, `user-event` 14).

**One workshop per chapter, one app all day**: an issue tracker that grows from
a hand-rolled fetch to optimistic updates. Yet each workshop is a **standalone
Angular CLI project** — its own `package.json`, `angular.json`, `.nvmrc` and
`README.md`, its own `npm install` — so you can take them in any order, and a
workshop you could not finish never blocks the next one.

All code is **TypeScript**, in standalone components with signals, the `@if` /
`@for` control flow and zoneless change detection (Angular 22's default).

```bash
cd 01_first_queries
nvm use              # Node.js 24, from .nvmrc
npm install
npm run dev          # ng serve — http://localhost:4200
npm test             # ng test --watch=false — the given spec, red on the starter
npm run test:watch   # ng test, in watch mode: keep it open while you work
npm run typecheck    # ngc (templates included) + tsc for the specs
npm run build        # ng build
```

## Toolchain versions

Dependencies were last refreshed on **2026-10-08**. One deliberate pin:

| Pin | Why |
|---|---|
| `@tanstack/angular-query-experimental` **5.104.1**, exactly | The Angular adapter is labelled *experimental*: breaking changes may land in minor **and patch** releases. Its own README asks you to pin the exact version — and so does every workshop. |
| `typescript` **~6.0** | Angular 22 requires `>=6.0 <6.1`. |

`npm test` runs **Vitest through the Angular CLI** — the
`@angular/build:unit-test` builder, in jsdom. There is no `vitest.config.ts`: the
`test` target of `angular.json` picks up every `src/**/*.spec.ts`, and TestBed is
initialised for you, zoneless like the app.

## The shared parts — do not edit them

Two folders of every workshop are **copies**, written by the training's sync from
[`tanstack-query-common`](../../tanstack-query-common) (the same files serve the React
and Vue trainings):

| Folder | What | |
|---|---|---|
| `src/api/` | `fakeApi.ts` — an in-memory issue tracker that answers after **400 ms** and logs every request; `networkPanel.ts` — the panel at the bottom of the page | framework-agnostic |
| `src/tests/shared/` | `workshop.spec.ts` — the given spec of the workshop (none in 06) | Testing Library DOM + Vitest |

Both are gitignored and rewritten by `pnpm run sync` at the root of the training
(the starter and solution ZIPs ship them). Change them in the shared folder, never
here.

The spec only knows two things: what the page shows (`data-testid`s), and
`apiLog`, the list of requests the fake server received. It renders the whole
app through **`src/tests/render.ts`** — the one file of the specs that knows it
is Angular: `render(App, { providers: [provideTanStackQuery(createQueryClient())] })`
from `@testing-library/angular`, a fresh client per test, cleaned up after each.

## The Network panel

`src/main.ts` calls `mountNetworkPanel()` once: the dark panel pinned to the
bottom of the page counts every request the fake server received. **A `GET` sent
more than once shows up in red** — the thing a query layer is there to avoid. It
also has switches: the latency, "the server refuses every write", "fail the next
request", and "another user closes an issue". It is your instrument: read it
before and after every step.

The other instrument is the **TanStack Query devtools**: once the client is
provided with `withDevtools()`, a flower button at the bottom of the app opens the
cache — every key, its state, its observers, and buttons to refetch, invalidate,
reset or trigger an error. No browser extension.

## Workshops

| Chapter | Folder | Topic |
|---|---|---|
| 1 | `01_first_queries/` | `provideTanStackQuery`, `injectQuery`, a key factory, `isPending` vs `isFetching` |
| 2 | `02_query_configuration/` | `staleTime`, `skipToken`, `placeholderData` from the list cache, `refetchOnWindowFocus` |
| 3 | `03_pagination_infinite/` | `keepPreviousData`, `prefetchQuery` in an `effect()`, `injectInfiniteQuery` |
| 4 | `04_mutations/` | `injectMutation` in your own inject functions, invalidation, callbacks, `injectIsMutating` |
| 5 | `05_optimistic_updates/` | Optimistic updates through the cache and through the UI, rollbacks |
| 6 | `06_testing/` | `renderWithClient`, the error state two ways, mutations, `TestBed.runInInjectionContext` |

> Each folder is a starter: implement the `// TODO (step N)` markers following
> the steps of its own `README.md`.

Workshops 01, 02, 04 and 05 grow the same app: the starter of 02 is the solution
of 01, and so on. Workshop 03 is a different screen of the same tracker (a paged
table and an activity feed). Workshop 06 tests the app of workshop 04.

Every workshop README opens with **The workshop at a glance** — one row per step,
naming what you do, the file you open and how you know it worked — and ends with
a **Definition of Done**, a checklist you can verify yourself. In between, each
step closes on a `→ **Done when**` line. Steps marked *(Bonus)* and the "Going
further" section are deliberately **outside** the DoD.

**`06_testing/` is the workshop where you write the tests**, so its starter is
green from the start: a list of `it.todo`s, and no shared spec. That is also why
the CI checks it differently (`.github/workflows/workshops.yml`).

The worked answer to every workshop lives in `../solutions/`, one runnable folder
per workshop. Do not hand it out before the exercise.

## Node version

Every workshop targets **Node.js >= 22.22.2** (24 recommended, and what `.nvmrc`
pins). Run `nvm use` in the workshop folder to pick up the version from its
`.nvmrc`.
