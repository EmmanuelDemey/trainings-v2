# Workshop 01 — First queries

> The app works as shipped — it fetches its data the way most React apps start:
> a `useEffect`, three `useState` and a `try` / `finally` per component. Hand the
> server state to TanStack Query, and count the requests at every step.

## Goal

Chapter 01 — Replace hand-rolled fetching with **`@tanstack/react-query`**:

- **One cache** for the whole app: two components, same key, one request
- **A key factory** and **`queryOptions`**: key and fetcher defined once, typed
- **A key that follows the state** of the component — no dependency array
- **Fetching is not loading**: `isPending` for "nothing to show yet",
  `isFetching` for "a request is in flight, maybe behind data"

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 01 of the deck: query keys, the query function, the statuses

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch   # keep it open in a second terminal
npm run typecheck    # tsc --noEmit
```

The spec is already written: **`src/tests/shared/workshop.spec.ts`** renders the
whole app with `renderApp()` (`src/tests/render.tsx`) and reads two things only —
what the page shows, and `apiLog`, the requests the fake server received. It is
red on the starter.

> `src/api/` and `src/tests/shared/` are **shared copies** (the same for the
> React, Angular and Vue editions of this training): do not edit them. Your code
> goes in `src/main.tsx`, `src/queries/` and `src/components/`.

The fake API answers after **400 ms**, and the **Network panel** at the bottom of
the page counts every request it received — a `GET` sent more than once shows in
red.

**Already done for you**: `src/queryClient.ts` exports `createQueryClient()`, and
`src/tests/render.tsx` already wraps the app in a `QueryClientProvider` for the
spec. The app itself does not use either yet.

**The bugs you are about to fix**, all visible on the page as shipped:

- Loading the page sends `GET /issues?status=open` **twice** — the list and the
  header counter each fetch their own copy. (In `npm run dev` the panel even
  shows it **four** times: `<StrictMode>` runs every effect twice in development,
  precisely to expose effects like these.)
- Going back to a filter you just left shows **"Loading…"** again.
- Set the latency to 3000 ms, click **closed** then **open** quickly: a slow
  answer can land after a fast one and **overwrite** it.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Install the provider and the devtools | `main.tsx` | The TanStack logo shows at the top right, and the devtools open |
| 2 | Write `issueKeys` and `issuesQuery`, move the counter and the list to `useQuery` | `queries/issues.ts`, `IssueCounter.tsx`, `IssueList.tsx` | `npm test` — step 2 green: one `GET` for two components |
| 3 | A key that follows the filter | `IssueList.tsx` | `npm test` — step 3 green |
| 4 | `isPending` vs `isFetching` | `IssueList.tsx` | `npm test` — all green |

## Steps

### 1. Install the client — `main.tsx`

1. Create the client **once**, at the top level of the module:
   `const queryClient = createQueryClient();`. Never inside a component: every
   render would create a new, empty cache.
2. Wrap `<App />` in `<QueryClientProvider client={queryClient}>`.
3. Inside the provider, add `<ReactQueryDevtools buttonPosition="top-right" />`
   from `@tanstack/react-query-devtools` — top-right, so the Network panel does
   not hide it.

**Check it**: reload the page. The TanStack logo appears at the top right; click
it — the devtools are empty: no component uses a query yet.

→ **Done when** the devtools open, and the app still works.

### 2. One cache — `queries/issues.ts`, `IssueCounter.tsx`, `IssueList.tsx`

1. In `src/queries/issues.ts`, write the **key factory**:

   ```ts
   export const issueKeys = {
     all: ['issues'] as const,
     lists: () => [...issueKeys.all, 'list'] as const,
     list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
   };
   ```

2. Then `issuesQuery(filter)`, returning
   `queryOptions({ queryKey: issueKeys.list(filter), queryFn: () => fetchIssues(filter) })`.
   Key and fetcher travel together, and the type of `data` is inferred from
   `queryFn`.
3. In `IssueCounter.tsx`, replace the effect and the state with
   `const { data: issues } = useQuery(issuesQuery('open'))`, and show
   `issues.length` (or `…` while `issues` is `undefined`).
4. In `IssueList.tsx`, replace `issues`, `loading`, `error` and the effect with
   `useQuery(issuesQuery(filter))`. Read `data`, `isPending` and `error` from it.

**Check it**: reload. The Network panel shows `GET /issues?status=open` **once**,
even in development with `<StrictMode>`. In the devtools, one query,
`["issues","list","open"]`, with **2 observers**: the counter and the list.

→ **Done when** the step 2 spec is green, and neither component imports
`fetchIssues`.

### 3. A key that follows the filter — `IssueList.tsx`

You probably have it already: `issuesQuery(filter)` is called **at every
render** with the current `filter`, so the key changes with it. That is the whole
trick — there is no dependency array to forget. Check that it works:

1. Click **closed**: a new query `["issues","list","closed"]` appears in the
   devtools, and one `GET /issues?status=closed` in the Network panel.
2. Click **open** again: no "Loading…" — the list is already in the cache.
3. Try the race again (latency 3000 ms, closed → open quickly): each answer lands
   in **its own** cache entry, and the screen shows the entry of the current key.
   The race is gone without a single line about it.

→ **Done when** the step 3 spec is green.

### 4. Fetching is not loading — `IssueList.tsx`

`staleTime` is still 0: the list you come back to is **stale**, so TanStack Query
shows it at once **and** refetches it in the background.

1. Show `list-loading` only while `isPending` — nothing to show yet for this key.
2. Show `list-refreshing` ("refreshing…") while `isFetching && !isPending` — a
   request in flight behind data already on screen.

**Check it**: latency 3000 ms, then closed → open. The open list shows at once,
with "refreshing…" next to the filters for 3 seconds. In the devtools, the query
goes `fetching` then `stale`.

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No React warning in the browser console

**The behaviour is there**

- [ ] Loading the page sends **one** `GET /issues?status=open`, not two
- [ ] Coming back to a filter shows it at once — no "Loading…" — and refreshes
      it behind the data
- [ ] No component imports `fetchIssues`: it only appears in `src/queries/issues.ts`
- [ ] No `useEffect` and no `useState` for server data are left
- [ ] The devtools list `["issues","list","open"]` with two observers

**You can explain**

- [ ] Why two components with the same key send one request
- [ ] Why the race between two filters is gone, though nothing in the code
      mentions it
- [ ] The difference between `isPending` and `isFetching`, and which one the
      "refreshing…" hint uses
- [ ] Why the client is created outside of any component

## Going further

- Read `status` and `fetchStatus` in the devtools for each state of the list: the
  two booleans you used are combinations of these two.
- Remove `<StrictMode>` in `main.tsx`, put it back: what changes in the Network
  panel for the starter's code, and for yours?
- Write a `useIssues(filter)` custom hook around `useQuery(issuesQuery(filter))`.
  What does it add over `queryOptions`, and what does it take away
  (`prefetchQuery`, `getQueryData` cannot call a hook)?
