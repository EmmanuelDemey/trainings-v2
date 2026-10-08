---
layout: cover
---

# 02 - Query configuration

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Set** `staleTime` and `gcTime` app-wide in the client, and per query
- **Choose** when a query refetches: mount, window focus, reconnect, interval
- **Configure** retries, by status
- **Show** something before the first answer with `initialData` or
  `placeholderData` — and pick the right one
- **Make** a query wait with `enabled` or `skipToken`, and derive data with
  `select` — in React, without breaking memoisation

---
src: ../../tanstack-query-common/slides/02_configuration/stale-gc.md
---

---

# Where the options go, in React

```ts
// queryClient.ts — the policy of the app
new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: retryUnless404 } },
});
```

```ts
// queries/issues.ts — the policy of a resource, with its key
export function issueQuery(id: number) {
  return queryOptions({ queryKey: issueKeys.detail(id), queryFn: () => fetchIssue(id), staleTime: 60_000 });
}
```

```tsx
// a component — the needs of one screen
useQuery({ ...issuesQuery('open'), refetchOnWindowFocus: 'always' });
```

- Three levels, the most specific wins: **client** → **`queryOptions`** →
  **the hook call**. Spread, then override
- `queryClient.setQueryDefaults(issueKeys.all, { … })` — defaults for every key
  under a prefix, without touching the call sites

---
src: ../../tanstack-query-common/slides/02_configuration/refetch-triggers.md
---

---
src: ../../tanstack-query-common/slides/02_configuration/retry.md
---

---
src: ../../tanstack-query-common/slides/02_configuration/initial-placeholder.md
---

---

# A placeholder from the list, in React

```ts
export function useIssue(id: number | null) {
  const queryClient = useQueryClient();         // a hook: hence a custom hook

  return useQuery({
    ...issueQuery(id),
    placeholderData: () =>
      id === null
        ? undefined
        : queryClient
            .getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })
            .flatMap(([, issues]) => issues ?? [])
            .find((issue) => issue.id === id),
  });
}
```

```tsx
const { data: issue, isPlaceholderData } = useIssue(selectedId);
// `'description' in issue` — a summary has none: show it only once the real issue landed
```

- `useQueryClient()` is why this one is a **hook**, not just `queryOptions`
- The function runs while the query has no data: no effect, no state to sync

---
src: ../../tanstack-query-common/slides/02_configuration/enabled-select.md
---

---

# `skipToken`, `enabled`, `select` — React details

```tsx
// No selection, no request — and `id` is a number in the second branch
useQuery({
  queryKey: issueKeys.detail(id),
  queryFn: id === null ? skipToken : () => fetchIssue(id),
});
```

```tsx
// `select` runs again when its REFERENCE changes: an inline arrow runs at every render
const { data: count } = useQuery({ ...issuesQuery('open'), select: (issues) => issues.length });

// Expensive? A stable reference — module level, or useCallback
const selectTitles = (issues: IssueSummary[]) => issues.map((issue) => issue.title);
const { data: titles } = useQuery({ ...issuesQuery('open'), select: selectTitles });
```

- Whatever `select` returns is **structurally shared**: same content, same
  reference — `React.memo` children and effect dependencies stay quiet
- `enabled` takes a function of the query too: `enabled: (query) => …`
- `skipToken` is not supported by `useSuspenseQuery`: a suspending query must
  be able to run

---

## Workshop 02 — Query configuration
