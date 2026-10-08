# Something to show before the first answer

Two options give a query data **before** its query function resolves:

<div style="display: flex; gap: 2em;">
<div>

### `initialData`

```ts
queryOptions({
  queryKey: issueKeys.detail(id),
  queryFn: () => fetchIssue(id),
  initialData: () => issueFromSomewhere(id),
});
```

- **Written to the cache**, as if it had been fetched
- `status: 'success'` from the start — `isPending` is never `true`
- **Fresh or stale like real data**: it is fetched "at"
  `initialDataUpdatedAt` (default: **now**) and judged by `staleTime`
- Shared: every observer of the key sees it

</div>
<div>

### `placeholderData`

```ts
queryOptions({
  queryKey: issueKeys.detail(id),
  queryFn: () => fetchIssue(id),
  placeholderData: () => issueFromSomewhere(id),
});
```

- **Not** written to the cache — shown by **this observer** only
- `status: 'success'` with **`isPlaceholderData: true`**
- The query **always fetches**: the placeholder is never considered fresh
- Replaced as soon as the real data arrives

</div>
</div>

<br />

> Rule of thumb: `initialData` when what you have **is** the data (complete and
> trustworthy); `placeholderData` when it is a **preview** — partial, or maybe
> out of date.

---

# `initialData` and freshness

```ts
// The detail, seeded from the list, with a 30 s staleTime
queryOptions({
  queryKey: issueKeys.detail(id),
  queryFn: () => fetchIssue(id),
  staleTime: 30_000,
  initialData: () => listSummary(id),            // what the list had
});
```

- `initialData` is stamped **now**: with `staleTime: 30_000` it is **fresh** →
  **no fetch** for 30 s. If the seed was incomplete or old, the user sees it
  **as the truth**
- Tell the cache how old the seed really is:

```ts
initialData: () => listSummary(id),
initialDataUpdatedAt: () =>
  queryClient.getQueryState(issueKeys.list('open'))?.dataUpdatedAt,
// a seed from a list fetched 2 min ago is stale → refetched on mount
```

- `initialData` returning `undefined` = "no initial data" — the query starts
  `pending` as usual
- Ideal for data that **is** complete: a list item that has every field of the
  detail, data rendered by the server (SSR), a value you just received

---

# Seeding a detail from a list — the workshop 02 case

```ts
// The list returns IssueSummary (id, title, status, assignee, commentCount)
// The detail returns Issue = IssueSummary + description, createdAt, updatedAt

function summaryFromLists(queryClient: QueryClient, id: number): IssueSummary | undefined {
  // Every cached list — open, closed, all — whichever the user saw
  const lists = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });
  for (const [, issues] of lists) {
    const found = issues?.find((issue) => issue.id === id);
    if (found) return found;
  }
  return undefined;
}

export const issueQuery = (queryClient: QueryClient, id: number) =>
  queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: () => fetchIssue(id),
    // A summary is a PARTIAL Issue: render the description only once !isPlaceholderData
    placeholderData: () => summaryFromLists(queryClient, id) as Issue | undefined,
  });
```

- `getQueryData(key)` reads **one** exact key; `getQueriesData(filters)` reads
  every key matching a **prefix** → `[key, data][]`
- Read the cache **inside** the function: it runs when the observer needs a
  placeholder, so it sees the latest lists

<style>
.slidev-layout { --slidev-code-font-size: 11px; }
</style>

---

# Why `placeholderData` here, and not `initialData`

<div style="display: flex; gap: 2em;">
<div>

### With `initialData` ❌

- The summary is **written** under `['issues', 'detail', 7]`
- With `staleTime: 30_000` it is **fresh**: **no request**
- The panel shows the title… and **no description**, for 30 s, or forever on
  `Infinity`
- Every other reader of the detail now gets a **partial** issue from the cache

</div>
<div>

### With `placeholderData` ✅

- The title shows **at once** (`detail-title`)
- `GET /issues/7` is sent **anyway**
- The description appears when it arrives (`detail-description`)
- The cache only ever holds **complete** issues

</div>
</div>

<br />

| | `initialData` | `placeholderData` |
|---|---|---|
| Persisted in the cache | yes | no |
| Counts as fresh | yes, within `staleTime` | never |
| `isPlaceholderData` | `false` | `true` |
| Shared between observers | yes | no, per observer |
| Typical use | complete data you already have | a preview, previous page, partial data |

<style>
table { font-size: 0.85em; }
</style>

---

# `placeholderData` as a function, and `keepPreviousData`

```ts
placeholderData: (previousData, previousQuery) => previousData,
```

- When the **key changes** (filter, page, id), the observer passes the data of
  the **previous key** — the previous filter's list stays on screen while the
  new one loads, instead of a skeleton
- That function ships ready-made:

```ts
import { keepPreviousData } from '@tanstack/query-core';   // re-exported by every adapter

queryOptions({
  queryKey: issueKeys.page(page),
  queryFn: () => fetchIssuePage(page),
  placeholderData: keepPreviousData,      // v4: keepPreviousData: true
});
```

- `isPlaceholderData` tells you the data on screen belongs to the **previous**
  key — dim it, disable "next"
- The core of paginated queries — chapter 03
