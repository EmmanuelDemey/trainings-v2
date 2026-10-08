# TanStack Query for Vue — Workshops

Hands-on exercises for the **TanStack Query for Vue** training, based on
**TanStack Query 5.104** (`@tanstack/vue-query`), **Vue 3.5**, **Vite 8**,
**Vitest 5** and **Testing Library** (`@testing-library/vue` 8, `@testing-library/dom` 10).

**One workshop per chapter**, from 01 to 06, and each one is a **standalone
project**: its own `package.json`, `tsconfig.json`, `.nvmrc` and `README.md`,
its own `npm install`, and not a single import from another workshop. All day
long it is the same app — an issue tracker — growing a feature per chapter:
workshop N starts where workshop N−1 ended (03 is a page of its own, and 06
tests the finished app of 04).

```bash
cd 01_first_queries
npm install
npm run dev          # http://localhost:5173 — the app, with the Network panel at the bottom
npm test             # vitest run — the shared spec, red on the starter
npm run test:watch   # the same, in watch mode: keep it open while you work
npm run typecheck    # vue-tsc --noEmit
npm run build
```

## Toolchain versions

Dependencies were last refreshed on **2026-10-08**. One deliberate pin:

| Pin | Why |
|---|---|
| `typescript` **6.0**, not 7.x | `vue-tsc@3` patches TypeScript's `lib/tsc`, which TypeScript 7 (the native port) no longer exposes: `npm run typecheck` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. |

Every workshop targets **Node.js >= 22.22.2** (24 recommended, and what
`.nvmrc` pins). Run `nvm use` in the workshop folder to pick it up.

Install the **Vue Devtools** browser extension too (Chrome or Firefox): the
TanStack Query devtools are in the page itself (the TanStack logo, top right),
but the Vue Devtools show the refs every composable returns.

## How a workshop works

Every workshop folder holds the **starter**, and `../solutions/` the worked
answer, under the same name. Do not hand the solutions out before the exercise.

- The starter **runs** and **typechecks**: its bugs are visible on the page and
  in the Network panel, not compile errors.
- The places you work in are marked `// TODO (step N)`, and each step of the
  README names the files it touches.
- `npm test` runs the **shared spec** of the workshop. It is **red** on the
  starter; each step turns some of it green. When it is all green, and the
  **Definition of Done** at the end of the README is ticked, you are done.

### Two folders you do not edit

| Folder | What it is |
|---|---|
| `src/api/` | The **fake server** (`fakeApi.ts`): 42 issues, an activity feed, a latency of 400 ms, every request written in `apiLog` — and the **Network panel** (`networkPanel.ts`) that shows them. |
| `src/tests/shared/` | The **shared spec** of the workshop (`workshop.spec.ts`), the same for the React, Angular and Vue trainings. |

Both are **copies** of `../../tanstack-query-common/`, written by the training's
`pnpm run sync` and marked "GENERATED — do not edit". The spec does not know
Vue: it calls `renderApp()` from **`src/tests/render.ts`** — the one Vue file of
the specs, already written — then reads the page with Testing Library and
counts the requests in `apiLog`. Which means your app must keep the
**`data-testid`s** the README lists: they are the contract with the spec.

### The Network panel

Pinned to the bottom of every page: each request the fake server received, how
many times (a `GET` sent twice turns **red**), and which ones are still in
flight. Its switches make the server misbehave on demand:

- **Latency** — 0, 400, 1500 or 3000 ms;
- **The server refuses every write** — every `POST`, `PATCH` and `DELETE`
  fails with a 500;
- **Fail the next request** — whatever it is, with a 503;
- **Another user closes an issue** — the data changes on the "server", and the
  app is not told;
- **Clear the log**.

Read it before and after every step: most steps are judged on the requests the
app sends — or no longer sends.

## Workshops

| Chapter | Folder | Topic |
|---|---|---|
| 1 | `01_first_queries/` | `VueQueryPlugin`, `useQuery` with a getter, key factory, `queryOptions`, `isPending` vs `isFetching` |
| 2 | `02_query_configuration/` | `staleTime`, `skipToken` / `enabled`, `placeholderData` from the list, `refetchOnWindowFocus: 'always'`, `retry`, `select` |
| 3 | `03_pagination_infinite/` | `keepPreviousData`, `isPlaceholderData`, `prefetchQuery`, `useInfiniteQuery` on a cursor |
| 4 | `04_mutations/` | `useMutation`, invalidation, the callbacks of `mutate()`, `isPending`, `mutationKey`, `useIsMutating` |
| 5 | `05_optimistic_updates/` | Optimistic through the cache (snapshot, rollback), optimistic through the UI (`variables`) |
| 6 | `06_testing/` | `renderWithClient`, `findBy*`, the fake server vs `vi.mock`, a mutation, a composable in a host component, `using` spies |

Every workshop README opens with **The workshop at a glance** — one row per
step, naming what you do, the file you open and how you know it worked — and
ends with a **Definition of Done**, a checklist of criteria you can verify
yourself (a command that exits 0, something observable in the browser, a
question you can answer). In between, each step closes on a `→ **Done when**`
line. Steps marked *(Bonus)* and the "Going further" section are deliberately
**outside** the DoD: it is the floor, not the ceiling.

**`06_testing/` is the workshop where YOU write the tests**: it has no shared
spec, and its starter ships `it.todo`s — green from the start. That is also why
the CI (`.github/workflows/tanstack-query-vue-workshops.yml`, at the root of the
repository) checks it the other way round: the solution's tests pass, and the
starter stays green.
