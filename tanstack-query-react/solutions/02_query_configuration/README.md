# Workshop 02 — Query configuration

> Workshop 01's app, plus an issue detail panel written the naive way. Tune the
> queries — freshness, conditions, placeholders, refetch triggers — until the
> Network panel only shows the requests that are worth sending.

## Goal

Chapter 02 — Configure queries instead of writing code around them:

- **`staleTime`** in the client's `defaultOptions`: coming back to a filter costs
  nothing — and the difference with `gcTime`
- **`skipToken`** (or `enabled`): no selection, no request
- **`placeholderData`** from the list cache: the title at once, the description
  when it comes — and why not `initialData`
- **`refetchOnWindowFocus: 'always'`** on the one query that must follow other users

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 02 of the deck; workshop 01 done, or not — this starter contains its
  solution

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch
npm run typecheck
```

The spec, **`src/tests/shared/workshop.spec.ts`**, is red on the starter.

> `src/api/` and `src/tests/shared/` are **shared copies**: do not edit them.

**New in this workshop**: each row has a **Details** button (`select-<id>`), and
the panel on the right shows the selected issue — `useIssue(id)` in
`src/queries/issues.ts`, rendered by `src/components/IssueDetail.tsx`.

**The bugs you are about to fix**, all visible on the page as shipped:

- Loading the page sends `GET /issues/undefined` — and its retries — though
  nothing is selected.
- Clicking **Details** shows "Loading…" for a full round trip, though the list
  on the left already knows the title.
- Going open → closed → open refetches the open list every time: `staleTime` is
  still 0.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `staleTime: 30_000` in `defaultOptions` | `queryClient.ts` | `npm test` — step 1 green: no request when you come back to a filter |
| 2 | No selection, no request: `skipToken` | `queries/issues.ts` | `npm test` — step 2 green: no `GET /issues/undefined` |
| 3 | `placeholderData` from the list cache | `queries/issues.ts`, `IssueDetail.tsx` | `npm test` — step 3 green: the title at once |
| 4 | `refetchOnWindowFocus: 'always'` on the counter | `IssueCounter.tsx` | `npm test` — all green |

## Steps

### 1. Fresh for 30 seconds — `queryClient.ts`

1. Pass `defaultOptions: { queries: { staleTime: 30_000 } }` to `new QueryClient(…)`.
   The spec builds its client with this same function: your defaults apply there
   too.

**Check it**: open → closed → open. The second visit to **open** sends nothing.
Now open the devtools and find `["issues","list","closed"]`: once you leave the
filter, it has **0 observers** — *inactive*. It stays in the cache for `gcTime`
(5 minutes by default) and is then garbage-collected. Stale or fresh is one clock
(`staleTime`); kept or dropped is another (`gcTime`).

→ **Done when** the step 1 spec is green.

### 2. No selection, no request — `queries/issues.ts`

`useIssue(undefined)` still runs its query function: `fetchIssue(undefined as number)`.

1. Replace `queryFn` with
   `id === undefined ? skipToken : () => fetchIssue(id)`. With `skipToken`,
   TypeScript knows `id` is a number in the second branch — the `as number` lie
   goes away. (`enabled: id !== undefined` works too, but leaves the lie in place.)

**Check it**: reload. No `GET /issues/undefined` in the Network panel; in the
devtools, the detail query of no issue sits there, *disabled*.

→ **Done when** the step 2 spec is green.

### 3. The title at once — `queries/issues.ts`, `IssueDetail.tsx`

The open list in the cache already holds the summary of every open issue.

1. In `useIssue`, get the client with `useQueryClient()`, and add a
   `placeholderData` function that looks for the issue in every cached list:
   `queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`
   returns `[key, data]` pairs.
2. A summary is not an issue: it has no `description`. Type the query function's
   result as `Issue | IssueSummary` (`(): Promise<Issue | IssueSummary> => fetchIssue(id)`),
   and in `IssueDetail.tsx` render `detail-description` only when
   `'description' in issue`, "Loading the description…" otherwise.

Why not `initialData`? `initialData` is **written to the cache** as if it were
the real thing — fresh for 30 seconds, so the description would not be fetched
before then. A placeholder is only **shown**, never cached, and the query fetches
as usual.

**Check it**: latency 1500 ms, click **Details** on any row: the title is there at
once, the description 1.5 s later. The devtools show the detail query with
`isPlaceholderData` until then.

→ **Done when** the step 3 spec is green, and the panel never shows "Loading…"
for an issue of the list.

### 4. Follow the other users — `IssueCounter.tsx`

With `staleTime: 30_000`, a focus inside those 30 s refetches nothing:
`refetchOnWindowFocus: true` (the default) only refetches **stale** queries.

1. Spread `issuesQuery('open')` into an object and add
   `refetchOnWindowFocus: 'always'` — on the counter only.

**Check it**: click **Another user closes an issue** in the Network panel, then
switch to another tab and back. The counter drops by one; the Network panel shows
the refetch.

→ **Done when** `npm test` is fully green.

### 5. *(Bonus)* `retry` and `select`

- In `queryClient.ts`, `retry: (failureCount, error) => …` — no retry when the
  error is an `ApiError` with status 404, the default 3 otherwise.
- In the counter, `select: (issues) => issues.length`: the cache keeps the list,
  the component only re-renders when the **number** changes.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Coming back to a filter within 30 s sends nothing
- [ ] Loading the page sends no `GET /issues/…` for a detail
- [ ] The detail panel shows the title at once, the description when it arrives
- [ ] The counter refreshes when you come back to the tab, even within 30 s

**You can explain**

- [ ] What `staleTime` changes, and what `gcTime` changes — a query can be stale
      and still cached, or fresh and unused
- [ ] Why `skipToken` is safer than `enabled` with TypeScript
- [ ] Why `placeholderData` and not `initialData` for the detail
- [ ] Why `refetchOnWindowFocus: true` does nothing on a fresh query

## Going further

- Set `gcTime: 5_000` on the detail query, select an issue, select another one,
  and watch the first one disappear from the devtools 5 s later. Select it again:
  pending, or not?
- What would `initialData` + `initialDataUpdatedAt` from the list's
  `dataUpdatedAt` (`queryClient.getQueryState(key)`) give you? When would it be
  the right choice?
- `refetchOnWindowFocus` listens to `visibilitychange` through `focusManager`.
  In a React Native or Electron app there is no such event: look at
  `focusManager.setEventListener` — what would you plug into it?
