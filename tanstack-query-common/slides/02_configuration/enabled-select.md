# `enabled` — a query that waits

```ts
// The detail panel, nothing selected yet: selectedId is null
queryOptions({
  queryKey: [...issueKeys.details(), selectedId],   // null is a valid key part
  queryFn: () => fetchIssue(selectedId!),
  enabled: selectedId !== null,           // or (query) => boolean
});
```

- Without it: `GET /issues/null` on load — the starter of workshop 02 sends
  `GET /issues/undefined`
- A disabled query does **not** fetch on mount, focus, reconnect, interval or
  invalidation; it stays `pending` + `idle` if it has no data
- → for a spinner, use **`isLoading`** (`isPending && isFetching`), not
  `isPending`, or the empty panel shows a spinner forever
- `refetch()` still works on a disabled query (a manual "Load" button)
- Data already cached for the key is **still returned** while disabled

---

# Dependent queries

Query B needs a value from query A:

```ts
// A: the current user
const meQuery = queryOptions({ queryKey: ['me'], queryFn: fetchMe });

// B: their assigned issues — waits for A's data
const assignedQuery = (me: User | undefined) =>
  queryOptions({
    queryKey: ['issues', 'assigned', me?.name],
    queryFn: () => fetchAssigned(me!.name),
    enabled: !!me,
  });
```

```text
t=0     me: fetching           assigned: pending + idle (disabled)
t=400   me: success            assigned: fetching
t=800                          assigned: success
```

- A **waterfall** by nature: two round trips in sequence. Fine when B really
  needs A; a smell when it doesn't
- If the server can answer in one call (`GET /me/issues`), prefer it — or
  **prefetch** B on the server side of the route (chapter 07)

---

# `skipToken` — the type-safe way

```ts
import { skipToken } from '@tanstack/query-core';   // re-exported by every adapter

export const issueQuery = (id: number | null) =>
  queryOptions({
    queryKey: [...issueKeys.details(), id],
    queryFn: id === null ? skipToken : () => fetchIssue(id),   // id: number here
  });
```

<div style="display: flex; gap: 2em;">
<div>

### `enabled: false`

- Needs a `!` or a cast: TypeScript does not know the function never runs
  without an id
- `refetch()` runs the query function anyway

</div>
<div>

### `skipToken`

- **Narrows** the type: no `!`
- One place expresses both "what to fetch" and "whether to fetch"
- `refetch()` does **not** run it (there is nothing to run)

</div>
</div>

<br />

- Both give the same status: `pending` + `idle` while skipped
- Prefer `skipToken` when the condition is "a parameter is missing"; `enabled`
  for "a parameter is there but not now" (a tab not open, a feature flag off)

---

# `select` — derive, don't copy

```ts
// The header counter only needs a number
const openCountQuery = queryOptions({
  ...issuesQuery('open'),
  select: (issues) => issues.length,           // data: number
});

// A list sorted for this screen only
const byTitle = (issues: IssueSummary[]) => [...issues].sort((a, b) => a.title.localeCompare(b.title));
```

- The cache keeps the **full** server answer; `select` shapes what **this**
  observer receives
- Two observers of `['issues', 'list', 'open']` with different `select`s share
  **one** request and **one** entry
- The component re-renders only when the **selected** value changes: the
  counter does not re-render when a title changes, only when the count does
- `select` runs when the data **or the function reference** changes — define it
  outside the component (or memoise it) for expensive transforms
- Never copy `data` into local state "to transform it": the copy stops updating

---

# Defaults: app-wide, then per key

```ts
export function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry },
      mutations: { retry: 0 },
    },
  });

  // Every query whose key starts with ['activity']
  queryClient.setQueryDefaults(['activity'], { staleTime: 5_000, refetchInterval: 15_000 });
  // Reference data
  queryClient.setQueryDefaults(['countries'], { staleTime: Infinity, gcTime: Infinity });

  return queryClient;
}
```

Precedence, lowest to highest:

1. `defaultOptions.queries` of the `QueryClient`
2. `setQueryDefaults(prefix, …)` — every registration whose key **prefix-matches**,
   merged in registration order (register the generic ones first)
3. The options of the query itself — `queryOptions(…)` and what the call site spreads

> Put **policies** in defaults (staleTime, retry), and **facts about a
> resource** in its `queryOptions` — not the other way round.
