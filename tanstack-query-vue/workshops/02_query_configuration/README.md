# Workshop 02 — Query configuration

> The app of workshop 01, plus an issue detail panel — wired the naive way. Tune
> freshness, turn the detail off until it is needed, show what the list already
> knows, and keep the counter honest when other users change the data.

## Goal

Chapter 02 — Query configuration:

- **`staleTime`** in the client's defaults — and `gcTime`, its other clock
- **`skipToken`** (or `enabled`): a query that waits for its input
- **`placeholderData`** from the list cache — and why not `initialData` here
- **`refetchOnWindowFocus: 'always'`** on one query
- *(Bonus)* **`retry`** by status, **`select`**

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 02 of the deck. The starter is the solution of workshop 01.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch
npm run typecheck    # vue-tsc --noEmit
```

**Do not edit** `src/api/` nor `src/tests/shared/`: copies of
`tanstack-query-common/`, shared with the React and Angular trainings. The
spec renders your app through `src/tests/render.ts`, with **your**
`createQueryClient()` — the `defaultOptions` you set in step 1 apply to it.

The test ids of workshop 01 stay. New ones:

| Test id | What |
|---|---|
| `select-<id>` | the "Details" button of each row |
| `detail-empty` | the panel, while nothing is selected |
| `detail-title` | the title of the selected issue |
| `detail-description` | its description — only once the detail arrived |

**The bugs you are about to fix**:

- `GET /issues/undefined` leaves on load — and fails, and is retried: the
  detail query runs though nothing is selected.
- Select an issue: the panel stays empty for a full round trip, though the
  list on its left already knows the title.
- Switch `open → closed → open`: the open issues are refetched every time
  (`staleTime` is 0 — workshop 01 relied on it).
- Click **Another user closes an issue**, leave the tab, come back: once
  `staleTime` is set (step 1), the counter keeps saying 28.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `staleTime: 30_000` in `defaultOptions` | `queryClient.ts` | Spec "step 1" green; `gcTime` read in the devtools |
| 2 | No detail request until an issue is selected | `queries/issues.ts`, `IssueDetail.vue` | No `GET /issues/undefined` — spec "step 2" green |
| 3 | `placeholderData` from the cached lists | `IssueDetail.vue` | The title at once, the description later — spec "step 3" green |
| 4 | `refetchOnWindowFocus: 'always'` on the counter | `OpenCounter.vue` | `npm test` all green |

## Steps

### 1. `staleTime` — `queryClient.ts`

```ts
return new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});
```

For 30 seconds after it arrived, the data is **fresh**: a component that
mounts, or a filter you come back to, reads the cache and sends **nothing**.
Past that, it is still shown at once — and refetched in the background.

**Check it**: switch `open → closed → open`: two `GET`s, not three. In the
devtools, the query turns from **fresh** to **stale** after 30 s. Now switch
to **closed** and look at the **open** query: **inactive** (no observer left),
still cached — for `gcTime`, 5 minutes by default. Stale and cached are two
different clocks.

→ **Done when** the spec "step 1 — staleTime" is green.

### 2. A query that waits — `queries/issues.ts`, `IssueDetail.vue`

Nothing selected is a state of the detail, not an error. Let `issueKeys.detail`
and `issueQuery` accept `number | undefined`, and give the query no function
until there is an id:

```ts
export function issueQuery(id: number | undefined) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: id === undefined ? skipToken : () => fetchIssue(id),
  });
}
```

Then, in `IssueDetail.vue`, drop the `as number`:
`useQuery(() => issueQuery(props.issueId))`. A getter again: `props.issueId` is
read inside it, so selecting another issue builds another key.

`enabled: props.issueId !== undefined` works too — but TypeScript still wants
a number inside the fetcher (`props.issueId!`). With `skipToken`, the type
narrows by itself.

**Check it**: reload — no `GET /issues/undefined` in the Network panel. In the
devtools, `["issues","detail",null]` is listed as **disabled**.

→ **Done when** the spec "step 2 — enabled" is green.

### 3. Show what the list knows — `IssueDetail.vue`

1. `const queryClient = useQueryClient()` — during `setup`, like every
   composable.
2. Find the summary of the selected issue in **any** cached list:
   `queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`
   returns `[key, data]` pairs.
3. Return it from `placeholderData`. A summary has no description: fill what
   only the detail knows with blanks, and show `detail-description` only when
   `isPlaceholderData` is false.

   ```ts
   const { data: issue, isPlaceholderData, error } = useQuery(() => ({
     ...issueQuery(props.issueId),
     placeholderData: () => summaryFromLists(props.issueId),
   }));
   ```

Why not `initialData`? It is written **to the cache**, as if it came from the
server — fresh for 30 s, so the real detail, with its description, would not be
fetched. A placeholder is shown, never cached, and the query fetches at once.

**Check it**: latency at 1500 ms, select an issue: the title shows at once,
"Loading the description…" under it, then the description. One
`GET /issues/<id>`.

→ **Done when** the spec "step 3 — placeholderData" is green.

### 4. Other users change the data too — `OpenCounter.vue`

With `staleTime: 30_000`, a **fresh** query is not refetched when the tab gets
the focus back: `refetchOnWindowFocus: true` means "if stale". The counter must
follow other users anyway:

```ts
const { data: openIssues } = useQuery({
  ...issuesQuery('open'),
  refetchOnWindowFocus: 'always',
});
```

An option of **this** observer: the list, on the same key, keeps the default.

**Check it**: click **Another user closes an issue**, switch to another tab and
back: the counter says 27, and one more `GET /issues?status=open` shows in the
Network panel.

→ **Done when** `npm test` is all green.

### 5. *(Bonus)* `retry` and `select`

- In `defaultOptions.queries`, a `retry` function: no retry on a 404 (`error
  instanceof ApiError && error.status === 404`), the usual three otherwise.
  To see it, select an issue with `:issue-id="999"` hard-coded in `App.vue`:
  the 404 shows at once, instead of after three retries (~7 s).
- In the counter, `select: (issues) => issues.length`: the cache keeps the list,
  the component gets a number — and does not re-render when a refetch brings
  the same count.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing (bonus TODOs aside)
- [ ] No Vue warning in the browser console

**The behaviour is there**

- [ ] Coming back to a filter within 30 s sends nothing
- [ ] No `GET /issues/undefined`, ever
- [ ] Selecting an issue shows its title at once, its description after one
      `GET /issues/<id>`
- [ ] The counter follows **Another user closes an issue** when you come back
      to the tab

**You can explain**

- [ ] `staleTime` vs `gcTime`: what each one decides, and why a query can be
      stale and still cached
- [ ] `skipToken` vs `enabled`
- [ ] Why `placeholderData`, and not `initialData`, for the detail
- [ ] Why the counter needs `'always'` and not `true`

## Going further

- `gcTime: 0` on the detail query: select an issue, select another, come back.
  What does the Network panel say?
- Turn `placeholderData` into a reusable composable,
  `useIssue(id: MaybeRefOrGetter<number | undefined>)`, with `toValue(id)`
  inside the getter.
- `refetchInterval: 10_000` on the counter, and `refetchIntervalInBackground`:
  when is polling the better answer?
