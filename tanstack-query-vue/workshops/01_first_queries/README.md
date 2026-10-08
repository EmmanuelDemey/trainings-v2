# Workshop 01 — First queries

> The app fetches its data the way most apps start: `onMounted`, three refs and
> a `try` / `finally` per component. Hand the server state to
> `@tanstack/vue-query`, and count the requests at every step.

## Goal

Chapter 01 — Queries and query keys, fetching vs loading:

- **Install** the client with `VueQueryPlugin`, and the devtools
- **One cache** for the whole app: two components, same key, one request
- **A key factory** and `queryOptions`: the key and the fetcher travel together
- **A key that follows the filter**, through a getter
- **`isPending` vs `isFetching`**: "nothing to show yet" is not "a request is
  in flight"

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 01 of the deck

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch   # keep it open in a second terminal
npm run typecheck    # vue-tsc --noEmit
```

**Do not edit** `src/api/` (the fake server and the Network panel) nor
`src/tests/shared/` (the spec): they are copies of
`tanstack-query-common/`, shared with the React and Angular trainings.
`src/tests/render.ts` is how the spec renders your app — already written: it
installs `VueQueryPlugin` with a fresh `createQueryClient()` for each test.

The spec, `src/tests/shared/workshop.spec.ts`, is **red** on the starter. It
reads the page through these test ids — keep them:

| Test id | What |
|---|---|
| `open-count` | the header counter, "28 open" |
| `filter-open`, `filter-closed`, `filter-all` | the three filter buttons |
| `issue-<id>` | one row per issue |
| `list-loading` | nothing to show yet |
| `list-refreshing` | a request in flight **behind** data already shown |
| `list-error` | the request failed |

**The bugs you are about to fix**, all visible in the Network panel:

- Loading the page sends `GET /issues?status=open` **twice** — the list and the
  header counter each fetch their own copy (the row turns red).
- Coming back to a filter you just left shows "Loading…" again, and refetches.
- Set the latency to 3000 ms, click **closed** then **open** quickly: the two
  answers race, and nothing guarantees the last one to land is the one you
  asked for last.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Install `VueQueryPlugin` and `<VueQueryDevtools />` | `main.ts` | The TanStack logo shows, top right, and the devtools open |
| 2 | A key factory, `issuesQuery(filter)`, and `useQuery` in both components | `queries/issues.ts`, `OpenCounter.vue`, `IssueList.vue` | One `GET /issues?status=open` on load — spec "step 2" green |
| 3 | A key that follows the filter | `IssueList.vue` | Spec "step 3" green |
| 4 | `isPending` for `list-loading`, `isFetching` for `list-refreshing` | `IssueList.vue` | `npm test` all green |

## Steps

### 1. Install the client — `main.ts`

1. Install the plugin with **your** client — not one the plugin would build,
   so that the spec builds its own with the same function:

   ```ts
   import { VueQueryPlugin } from '@tanstack/vue-query';
   import { createQueryClient } from './queryClient';

   createApp(App).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');
   ```

   `VueQueryPlugin` `provide`s the client to the whole app: every `useQuery`
   `inject`s it. It is Vue's `<QueryClientProvider>`.
2. Render the devtools **next to** `App`, in the root of `main.ts`, not inside
   `App.vue` — the spec renders `App`, and the devtools have nothing to do in
   jsdom:

   ```ts
   import { createApp, h } from 'vue';
   import { VueQueryDevtools } from '@tanstack/vue-query-devtools';

   const root = () => [h(App), h(VueQueryDevtools, { buttonPosition: 'top-right' })];
   createApp(root).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');
   ```

   In a production build, `@tanstack/vue-query-devtools` resolves to an empty
   stub: nothing to remove before shipping.

**Check it**: the TanStack logo is top right (the Network panel takes the
bottom). Open it: no query yet — nothing uses the client.

→ **Done when** the app runs as before, and the devtools panel opens (empty).

### 2. One cache — `queries/issues.ts`, `OpenCounter.vue`, `IssueList.vue`

1. In `src/queries/issues.ts`, write the **key factory**. Every key starts
   with the same root, from the most generic to the most specific:

   ```ts
   export const issueKeys = {
     all: ['issues'] as const,
     lists: () => [...issueKeys.all, 'list'] as const,
     list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
   };
   ```

2. Then `issuesQuery(filter)`, built with `queryOptions`:

   ```ts
   export function issuesQuery(filter: IssueFilter) {
     return queryOptions({
       queryKey: issueKeys.list(filter),
       queryFn: () => fetchIssues(filter),
     });
   }
   ```

   No component can now pair the key of the open issues with the fetcher of
   the closed ones, and `queryOptions` types the key with its data.
3. In `OpenCounter.vue`, replace the three refs and `onMounted` with
   `const { data: openIssues } = useQuery(issuesQuery('open'))`. `data` is a
   **ref**: `openIssues.value` in the script, `openIssues` in the template.
4. In `IssueList.vue`, replace `issues`, `loading`, `error` and `load()` with
   `useQuery`, for the open issues for now — and map the template to what it
   returns (`data`, `isPending`, `error`).

**Check it**: reload. The Network panel shows **one** `GET /issues?status=open`,
not two. In the devtools, `["issues","list","open"]` has **2 observers**: the
counter and the list share one query.

→ **Done when** the spec "step 2 — one cache for the whole app" is green.

### 3. A key that follows the filter — `IssueList.vue`

Pass `useQuery` a **getter**:

```ts
const { data: issues, isPending, isFetching, error } = useQuery(() => issuesQuery(filter.value));
```

`useQuery` runs the getter inside a `computed`: reading `filter.value` there is
tracked, so a new filter gives a new key — and a new query.
`useQuery(issuesQuery(filter.value))` would read the filter **once**, during
`setup`, and show the open issues forever.

The race is gone too: each filter has its own entry in the cache, and the list
always shows the entry of the **current** key. A late answer for a filter you
left lands in its own entry, not on screen.

**Check it**: switch `open → closed → open` and read the Network panel, then
the devtools: one query per filter. Coming back to **open** shows the list at
once — and still sends a `GET` (more on that in chapter 02).

→ **Done when** the spec "step 3 — a key that follows the filter" is green.

### 4. Fetching is not loading — `IssueList.vue`

- `list-loading` (the "Loading…" that replaces the list) must use
  **`isPending`**: there is **no data yet** for this key.
- `list-refreshing` (a discreet hint next to the filters) must use
  **`isFetching`**: a request is in flight — here, **behind** data already
  shown, so `isFetching && !isPending`.

**Check it**: set the latency to 3000 ms, visit **closed**, come back to
**open**: the open issues show at once, with "refreshing…" for three seconds.
The devtools show the query `fetching` while its data is there.

→ **Done when** `npm test` is all green.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No Vue warning in the browser console

**The behaviour is there**

- [ ] Loading the page sends **one** `GET /issues?status=open`, not two
- [ ] Coming back to a filter already visited shows it at once, without "Loading…"
- [ ] No component imports `fetchIssues`: it only appears in `src/queries/issues.ts`
- [ ] The devtools list one query per filter visited, and two observers on
      `["issues","list","open"]`

**You can explain**

- [ ] Why `useQuery(() => issuesQuery(filter.value))` follows the filter, and
      `useQuery(issuesQuery(filter.value))` does not
- [ ] Why two components asking for the same key send one request
- [ ] The difference between `isPending` and `isFetching`, and which one each
      of `list-loading` and `list-refreshing` uses
- [ ] Why the race between two filters is gone, without any code against it

## Going further

- Destructuring keeps the refs reactive: `const { data } = useQuery(…)` is
  safe, unlike destructuring a `reactive()`. Try `const query = useQuery(…)`
  and `query.data.value` instead — same thing.
- Turn on **Fail the next request** and switch filter: what does the list show,
  and after how long? (Three retries with backoff — chapter 02.)
- In the devtools, select `["issues","list","closed"]`, then **Refetch**,
  **Invalidate**, **Reset**: watch the list and the Network panel react.
