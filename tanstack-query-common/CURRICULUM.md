# TanStack Query — the curriculum the three trainings share

One day, the same programme, three frameworks:

| Training | Folder | Adapter |
|---|---|---|
| React Query (TanStack Query for React) | [`../tanstack-query-react`](../tanstack-query-react) | `@tanstack/react-query` |
| TanStack Query for Angular | [`../tanstack-query-angular`](../tanstack-query-angular) | `@tanstack/angular-query-experimental` |
| TanStack Query for Vue | [`../tanstack-query-vue`](../tanstack-query-vue) | `@tanstack/vue-query` |

This file is the contract between them: the chapters and the slide fragments they
import, the schedule, and what every workshop must do — the same test ids, the same
starter bugs, the same steps — whatever the framework. Write a framework training
against it; change it here first.

## What is shared, and how

| What | Single source | How a training gets it |
|---|---|---|
| The concepts: keys, staleTime/gcTime, mutations, optimistic updates, internals… | `slides/<NN>_<chapter>/<fragment>.md` | its own `slides/NN_*.md` imports them with Slidev's `src:` |
| The end-of-day retro | `slides/retro.md` | imported at the end of its last chapter |
| The fake API and the Network panel | `api/fakeApi.ts`, `api/networkPanel.ts` | `pnpm run sync` copies them to `src/api/` of every workshop and solution |
| The workshop specs (Testing Library, no framework) | `specs/<NN>_*.spec.ts` | `pnpm run sync` copies the one with the workshop's number to `src/tests/shared/workshop.spec.ts` |

The copies are **gitignored** and rewritten by the sync. `pnpm install` (postinstall)
and `pnpm run build` run it; so does the CI before testing a workshop.

A training owns only what is framework-specific: the adapter API (`useQuery` /
`injectQuery` / `useQuery` with getters), the setup, the devtools, the test helper
(`src/tests/render.ts`), and the workshop code and READMEs.

### Rules for the shared slide fragments

- **No adapter code.** A fragment may show `queryClient.*` calls (`invalidateQueries`,
  `setQueryData`, `cancelQueries`, `getQueriesData`…), option objects
  (`{ queryKey, queryFn, staleTime }`), `queryOptions(...)` — all identical in the three
  adapters — but never `useQuery`, `injectQuery`, a hook, a component or a template.
- Say "the adapter's query function" / "`useQuery` or `injectQuery`" when a sentence
  needs it; the training slide right after shows its own code.
- A fragment is one or more slides separated by `---`. It starts with a slide (no
  frontmatter of its own) and is imported as:

  ```md
  ---
  src: ../../tanstack-query-common/slides/01_queries/query-keys.md
  ---
  ```

## The schedule (7 hours)

| Time | Chapter | Workshop |
|---|---|---|
| 09:00 | 00 — Introduction | — |
| 09:15 | 01 — Queries and query keys · fetching vs loading | 01 — First queries (40 min) |
| 10:25 | *break* | |
| 10:40 | 02 — Query configuration | 02 — Configuration (40 min) |
| 11:50 | 03 — Paginated and infinite queries | 03 — Pagination & infinite (to finish after lunch) |
| 12:30 | *lunch* | |
| 13:50 | 04 — Mutations and callbacks | 04 — Mutations (35 min) |
| 14:50 | 05 — Optimistic updates and rollbacks | 05 — Optimistic updates (30 min) |
| 15:40 | *break* | |
| 15:55 | 06 — Debugging with the devtools · testing | 06 — Testing (35 min) |
| 16:50 | 07 — TanStack Query in a large application | — |
| 17:05 | 08 — Internals and performance · retro | — |

The programme of the training, item by item:

| Programme item | Chapter |
|---|---|
| Queries et Query Keys | 01 |
| Query Configuration : initialData, staleTime vs cacheTime, focus… | 02 |
| Infinite & Paginated Queries | 03 |
| Fetching vs Loading | 01 (statuses), revisited in 03 |
| Mutations & Configuration | 04 |
| Callbacks | 04 |
| Optimistic Updates & Rollbacks | 05 |
| Debugging avec les Devtools | 06 |
| Testing avec Jest, Testing Library et les mocks | 06 (Vitest — its API is Jest's; a slide maps one to the other) |
| Utilisation sur des applications conséquentes | 07 |
| Fonctionnement interne & Performance | 08 |

## The chapters and their fragments

Each training has `slides/NN_<name>.md` for every chapter below, with these names:

| # | Training file | Shared fragments, in `slides/` here |
|---|---|---|
| 00 | `00_intro.md` | `00_intro/agenda.md`, `00_intro/workshops.md` |
| 01 | `01_queries.md` | `01_queries/server-state.md`, `query-keys.md`, `query-function.md`, `statuses.md` |
| 02 | `02_configuration.md` | `02_configuration/stale-gc.md`, `refetch-triggers.md`, `retry.md`, `initial-placeholder.md`, `enabled-select.md` |
| 03 | `03_pagination_infinite.md` | `03_pagination_infinite/paginated.md`, `infinite.md` |
| 04 | `04_mutations.md` | `04_mutations/mutations.md`, `callbacks.md`, `invalidation.md`, `mutation-state.md` |
| 05 | `05_optimistic_updates.md` | `05_optimistic_updates/two-ways.md`, `via-cache.md`, `rollback.md` |
| 06 | `06_devtools_testing.md` | `06_devtools_testing/devtools.md`, `testing-principles.md`, `jest-vitest.md` |
| 07 | `07_at_scale.md` | `07_at_scale/organization.md`, `defaults-errors.md`, `prefetching.md`, `beyond.md` |
| 08 | `08_internals_performance.md` | `08_internals_performance/architecture.md`, `query-lifecycle.md`, `performance.md`, `checklist.md` |
| — | (last slide of chapter 08) | `retro.md` |

A training chapter is: a cover slide, the learning objectives, then the shared
fragments interleaved with its own adapter slides, and, for chapters 01 to 06, a last
slide `## Workshop NN — <name>`.

## The workshops

Six workshops, numbered as their chapter. Each is a **standalone** Vite (React, Vue) or
Angular CLI project — its own `package.json`, `package-lock.json`, `.nvmrc`, `README.md`
— and runs:

```bash
npm install
npm run dev          # the app, with the Network panel at the bottom
npm test             # vitest run — the shared specs, red on the starter
npm run test:watch
npm run typecheck
npm run build
```

### What every workshop has

- `src/api/` — synced, never edited. The entry file calls `mountNetworkPanel()` once.
- `src/queryClient.ts` — `export function createQueryClient(): QueryClient`. The app
  and the specs both build their client with it, so the learner's `defaultOptions`
  apply in the specs too.
- `src/tests/render.ts` — `export async function renderApp(): Promise<void>`: renders
  the whole app (the root component) in the document, inside a **fresh**
  `createQueryClient()` for each call, and makes sure the previous render is cleaned
  up. It is the only file of the specs that knows the framework.
- `src/tests/shared/workshop.spec.ts` — synced, given, red on the starter (none for
  workshop 06).
- The **solution** passes the shared spec, typechecks and builds; the **starter**
  typechecks (the spec included) and fails the spec. The CI checks both.

Test ids are the contract with the shared specs: keep them exactly, as
`data-testid`. The default filter is `open`. The data is the seed of
`api/fakeApi.ts`: 42 issues, ids 1 to 42, every third one closed (28 open, 14
closed); issue 1 is "Checkout button does nothing on Safari"; a new issue gets id 43;
34 activity events, ids 34 (newest) down to 1.

### 01 — First queries

**App.** A header with the open counter `open-count` ("28 open"). An issue list with
three filter buttons `filter-open`, `filter-closed`, `filter-all`; one row
`issue-<id>` per issue; `list-loading` while there is nothing to show yet,
`list-refreshing` while a request is in flight behind data already shown,
`list-error` on error.

**Starter.** No TanStack Query yet: each component fetches by hand (effect / `ngOnInit`
/ `onMounted`, three pieces of state, a `try/finally`). `queryClient.ts` exists, and
`render.ts` already provides the client — but the app does not use it. Visible bugs:
`GET /issues?status=open` twice on load; coming back to a filter shows "Loading…"
again; a slow filter answering after a fast one can overwrite it (race).

**Steps.** 1. Install the client (provider / `provideTanStackQuery` / plugin) and the
devtools. 2. Move the counter and the list to the adapter's query, with a **key
factory** `issueKeys` and `issuesQuery(filter)` built with `queryOptions` → one request
for both. 3. A key that follows the filter. 4. `isPending` vs `isFetching`:
`list-loading` uses the first, `list-refreshing` the second.

### 02 — Query configuration

**App.** Workshop 01's solution, plus an issue detail panel: each row has a button
`select-<id>`; the panel shows `detail-empty` when nothing is selected, then
`detail-title` and, once the detail arrived, `detail-description`.

**Starter.** Workshop 01's solution with a naive detail query — no `enabled`
(`GET /issues/undefined` on load), no placeholder (empty panel for a full round trip),
and the default `staleTime` of 0.

**Steps.** 1. `staleTime: 30_000` in `defaultOptions` → coming back to a filter sends
nothing; look at `gcTime` in the devtools. 2. `enabled` (or `skipToken`) on the detail.
3. `placeholderData` from the list cache (`getQueryData` / `getQueriesData`) for the
detail: the title at once, the description when it comes — and why not `initialData`
here. 4. The counter must follow other users: `refetchOnWindowFocus: 'always'` on it
(fresh queries are not refetched on focus otherwise). Bonus: `retry` by status (no
retry on a 404), `select` for the counter.

### 03 — Paginated and infinite queries

**App.** Two sections. "All issues": a paginated table (10 per page) with
`issue-<id>` rows, `page-prev`, `page-next`, `page-indicator` ("Page 1 / 5"),
`issues-loading` when there is nothing to show. "Activity": a feed with
`activity-<id>` items, a `load-more` button **absent** when there is nothing more to
load, and `activity-loading-more` while the next page loads.

**Starter.** The table uses a query per page without `placeholderData` (the table
empties at every click); the feed loads its first page with a plain query and
`load-more` does nothing.

**Steps.** 1. `placeholderData: keepPreviousData` (+ `isPlaceholderData` to disable
`page-next` / dim the table). 2. Prefetch the next page (`prefetchQuery`) as soon as
a page is shown. 3. The feed with the adapter's infinite query: `initialPageParam: 0`,
`getNextPageParam: (last) => last.nextCursor ?? undefined`, `fetchNextPage`,
`hasNextPage`, `isFetchingNextPage`. Bonus: `maxPages`.

### 04 — Mutations and callbacks

**App.** The open issues list (`issue-<id>`, a `delete-<id>` button per row) and
`open-count`; a form with the input `new-title`, the button `create-submit` and the
error `create-error`; in the header, `saving` while **any** mutation is in flight.

**Starter.** The form calls `createIssue` directly and refetches nothing (the new issue
never shows, the counter lies); delete calls `deleteIssue` directly; no error shown,
no pending state, no `saving`.

**Steps.** 1. The adapter's mutation for the creation, whose `onSuccess` **returns**
`invalidateQueries({ queryKey: issueKeys.all })`. 2. The callbacks of `mutate()`:
clear the input in its `onSuccess` only — a refused write keeps what was typed — and
show `error.message` in `create-error`. 3. `isPending` disables `create-submit`.
4. A delete mutation with a `mutationKey`, and `saving` in the header from
`useIsMutating` / `injectIsMutating` (or the mutation state). Bonus: `setQueryData`
with the server's response instead of a refetch.

### 05 — Optimistic updates and rollbacks

**App.** The open issues list with a `toggle-<id>` button per row (close / reopen),
`toggle-error` when a status change fails, `open-count`, and the creation form of
workshop 04 (`new-title`, `create-submit`) which shows `pending-issue` — the title,
greyed out — while the creation is in flight.

**Starter.** Toggling is a plain mutation that invalidates (the row moves only after
the round trip); creating shows nothing until the refetch.

**Steps.** 1. Optimistic through the cache: `onMutate` cancels `issueKeys.all`, takes a
snapshot with `getQueriesData({ queryKey: issueKeys.lists() })`, writes every list of the
snapshot with `setQueryData` (one per entry: an issue leaving the `open` list must be
removed from it, and `setQueriesData`'s updater does not receive the key), returns the
snapshot — the recipe of `slides/05_optimistic_updates/via-cache.md`. 2. The rollback in `onError` (restore every list of the snapshot, show
`toggle-error`), `onSettled` invalidates without returning the promise. 3. Optimistic
through the UI for the creation: render the mutation's `variables` as `pending-issue`
while `isPending` (`onSettled` returns the invalidation, so the pending row stays until
the real row is there). Bonus: `useMutationState` / `injectMutationState` to show the
pending row from another component.

### 06 — Debugging and testing

**App.** Workshop 04's solution, finished.

**Starter.** No shared spec. A `src/tests/` folder with `it.todo`s: the starter is green.
The learner writes, with the framework's Testing Library and Vitest:

1. A `renderWithClient` helper: a fresh `QueryClient` per test, `retry: false`,
   `gcTime: Infinity`.
2. The list: loading, then data — found with `findBy*`.
3. The error state — once with the fake server's switches (`apiSettings.failNextRequest`),
   once by replacing the API module (`vi.mock('../api/fakeApi')` in React and Vue; in
   Angular, whose unit-test builder refuses `vi.mock` on relative imports, a fake
   provided through an `InjectionToken`), and why the first
   tests more.
4. The creation mutation: the new row, the cleared input.
5. A custom hook / composable / injectable in isolation (`renderHook`, a host
   component, or `TestBed.runInInjectionContext`).

The devtools half of the chapter is a guided tour, done live on workshop 05's app.

## Versions

Refreshed on 2026-10-08: TanStack Query 5.104, React 19.3, Angular 22.2, Vue 3.5,
Vite 8.3, Vitest 5.0, TypeScript 6.0 (Angular 22 requires `>=6.0 <6.1`), Testing
Library (dom 10, react 16, angular 19, vue 8), Node.js 24.
