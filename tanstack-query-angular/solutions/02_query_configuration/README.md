# TP 02 — Query configuration

> The app of workshop 01, plus an issue detail panel. It works — and it sends
> too much, too early, and shows too little. Tune the queries until the Network
> panel only shows what is needed.

## Goal

Chapter 02 — Configure queries instead of writing code:

- **`staleTime`** in the defaults: coming back to a filter costs nothing
- **`skipToken`** (or `enabled`): no request until an issue is selected
- **`placeholderData`** from the list cache: the title at once, the description
  when it comes — and why not `initialData`
- **`refetchOnWindowFocus: 'always'`** on the counter: it follows the other users

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Workshop 01, or its solution: this starter **is** the solution of 01, plus the detail panel

## Setup

```bash
npm install
npm run dev          # http://localhost:4200
npm test             # ng test --watch=false — red on the starter
npm run test:watch
npm run typecheck
```

The spec is **`src/tests/shared/workshop.spec.ts`**: it renders the app through
`src/tests/render.ts`, with a client built by **your** `createQueryClient()` —
so the defaults you set in step 1 apply to it too. `src/api/` and
`src/tests/shared/` are shared copies: do not edit them.

**What is new**: each row has a **Details** button (`select-<id>`); `App` keeps the
selected id in a signal and passes it to `<app-issue-detail [issueId]="…">`,
whose `issueId` is an `input<number>()` — `undefined` until something is selected.

**The bugs you are about to fix**, all visible as shipped:

- Coming back to a filter refetches it every time: `staleTime` is 0.
- On load, before anything is selected, the Network panel shows
  `GET /issues/undefined` — a 404.
- Click **Details**: the panel stays on "Loading…" for a full round trip, although
  the list already knows the title.
- Click **Another user closes an issue** in the Network panel, then switch to
  another tab and back: once step 1 is done, the counter does not move.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `staleTime: 30_000` in the defaults | `queryClient.ts` | `npm test` — step 1 green; the devtools show "fresh" |
| 2 | No detail request without an id | `issues/issue-queries.ts`, `issues/issue-detail.ts` | No `GET /issues/undefined`; step 2 green |
| 3 | `placeholderData` from the list cache | `issues/issue-queries.ts`, `issues/issue-detail.ts` | The title shows at once; step 3 green |
| 4 | The counter refetches on focus, even fresh | `issues/open-count.ts` | `npm test` — all green |

## Steps

### 1. `staleTime` — `queryClient.ts`

1. Give the client `defaultOptions: { queries: { staleTime: 30_000 } }`.
2. Open the devtools: a query is **fresh** (green) for 30 seconds after it
   arrived, then **stale** (yellow). Leave a filter: its query, with no
   observer left, becomes **inactive** (grey), and is garbage-collected after
   `gcTime` (5 minutes by default) — two different clocks.

**Check it**: `open → closed → open` sends nothing the second time.

→ **Done when** the step 1 spec is green.

> Step 4 of the spec may have turned red now: a **fresh** query is not refetched
> on focus. That is what step 4 is about.

### 2. No request without an id — `issue-queries.ts`, `issue-detail.ts`

1. Make `issueDetailQuery` accept `id: number | undefined`.
2. Give it `queryFn: id === undefined ? skipToken : () => fetchIssue(id)`.
   `skipToken` (from `@tanstack/angular-query-experimental`) disables the query
   like `enabled: false` — and lets TypeScript narrow `id` to a number in the
   function. With `enabled: id !== undefined` you would still need `fetchIssue(id!)`.
3. In `IssueDetail`, drop the `as number`:
   `injectQuery(() => issueDetailQuery(this.issueId()))`. The `input()` is a
   signal: the query **enables itself** the moment the parent binds an id.

**Check it**: reload — no `GET /issues/undefined` in the Network panel.

→ **Done when** the step 2 spec is green.

### 3. `placeholderData` — `issue-queries.ts`, `issue-detail.ts`

1. In `issue-queries.ts`, write `issueSummaryFromLists(queryClient, id)`: loop
   over `queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`
   and return the issue with that id from the first list that has it.
2. The detail now shows either an `Issue` or an `IssueSummary` (no description):
   type the query function's result as
   `IssueSummary & Partial<Pick<Issue, 'description' | 'createdAt' | 'updatedAt'>>`.
3. In `IssueDetail`, add `private readonly queryClient = inject(QueryClient);`,
   and spread `issueDetailQuery(id)` with
   `placeholderData: () => (id === undefined ? undefined : issueSummaryFromLists(this.queryClient, id))`.
4. In the template, show `detail-description` only when `!detail.isPlaceholderData()`.

**Check it**: with a 3000 ms latency, click **Details**: the title shows at once,
"Loading the description…" for 3 seconds, then the description.

Why not `initialData`? It is written to the cache **as if it came from the server**
— fresh for 30 seconds: the detail would never be fetched, and the description
never shown. `placeholderData` is shown, never cached.

→ **Done when** the step 3 spec is green.

### 4. Follow the other users — `open-count.ts`

1. Spread the counter's options and add `refetchOnWindowFocus: 'always'`:
   `injectQuery(() => ({ ...issuesQuery('open'), refetchOnWindowFocus: 'always' }))`.
2. The default, `true`, only refetches **stale** queries on focus. `'always'`
   refetches this one anyway — and only for this observer: the list keeps the
   default.

**Check it**: click **Another user closes an issue** in the Network panel,
switch to another browser tab and back: the counter drops by one.

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src/app` returns nothing

**The behaviour is there**

- [ ] `open → closed → open` sends one `GET` per filter, and nothing when you come back
- [ ] No `GET /issues/undefined`, ever
- [ ] Selecting an issue shows its title at once, its description when it arrives
- [ ] The counter follows "Another user closes an issue" after a tab switch
- [ ] The devtools show the detail query **disabled** until something is selected

**You can explain**

- [ ] What `staleTime` changes, and what `gcTime` changes
- [ ] `skipToken` vs `enabled: false`: same behaviour, which one types better
- [ ] Why `placeholderData` here, and what `initialData` would break
- [ ] Why the counter needs `'always'` once `staleTime` is 30 seconds

## Going further

- *(Bonus)* `retry` by status in the defaults: no retry on a 4xx `ApiError`,
  up to 3 on the others —
  `retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 3`.
  Click **Fail the next request** in the Network panel, then refetch a list from
  the devtools: how many requests does a 503 cost now?
- *(Bonus)* `select` for the counter: `select: (issues) => issues.length`.
- Look at `gcTime` in the devtools: open a filter, leave it, and watch it go
  inactive. What would `gcTime: 0` change when you come back?
