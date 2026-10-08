---
layout: cover
---

# 01 - Queries and query keys

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why server state does not belong in `useState` + `useEffect`
- **Read** data with `useQuery`, a **key factory** and `queryOptions`
- **Write** keys that follow the component's state and props — without a
  dependency array, and without stale closures
- **Run** several queries at once with `useQueries`
- **Tell** fetching from loading: `isPending`, `isFetching`, `status`,
  `fetchStatus`

---
src: ../../tanstack-query-common/slides/01_queries/server-state.md
---

---

# What it replaces, in React

```tsx
// Before — in every component that needs the issues
const [issues, setIssues] = useState<IssueSummary[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  let ignore = false;                       // the race guard everyone forgets
  setLoading(true);
  fetchIssues(filter)
    .then((data) => { if (!ignore) setIssues(data); })
    .catch((e) => { if (!ignore) setError(e); })
    .finally(() => { if (!ignore) setLoading(false); });
  return () => { ignore = true; };
}, [filter]);
```

```tsx
// After
const { data: issues, isPending, error } = useQuery(issuesQuery(filter));
```

- No cache, no deduplication, no retry, no refetch on focus — and
  `<StrictMode>` runs that effect **twice** in development

---
src: ../../tanstack-query-common/slides/01_queries/query-keys.md
---

---

# `useQuery`

```tsx
import { useQuery } from '@tanstack/react-query';

function IssueCounter() {
  const { data: issues, isPending, error } = useQuery({
    queryKey: ['issues', 'list', 'open'],
    queryFn: () => fetchIssues('open'),
  });

  if (isPending) return <span>…</span>;
  if (error) return <span>{error.message}</span>;
  return <span>{issues.length} open</span>;   // narrowed: `issues` is defined here
}
```

- One hook call = one **observer** subscribed to one entry of the cache
- The component re-renders when the entry changes — and only for the properties
  it **reads** (chapter 08)
- `data` is `TData | undefined`; checking `isPending` (or `isSuccess`) narrows it:
  the result is a **discriminated union**

---

# `queryOptions` + `useQuery` — the React way

```ts
// queries/issues.ts — no React in here
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({ queryKey: issueKeys.list(filter), queryFn: () => fetchIssues(filter) });
}
```

```tsx
// any component
const { data } = useQuery(issuesQuery('open'));
const { data: count } = useQuery({ ...issuesQuery('open'), select: (issues) => issues.length });
```

- Prefer `queryOptions` over a `useIssues()` custom hook: the same object also
  feeds `prefetchQuery`, `getQueryData`, `setQueryData`, a router loader, a test
- A custom hook is still the right place for what **needs React**:
  `useQueryClient()`, another hook, a context value

---

# Keys follow state and props

```tsx
function IssueList() {
  const [filter, setFilter] = useState<IssueFilter>('open');
  // Re-evaluated at EVERY render: when `filter` changes, the key changes,
  // and useQuery switches to another entry of the cache.
  const { data } = useQuery(issuesQuery(filter));
}
```

- No dependency array: **the key is the dependency array**. Everything the
  `queryFn` reads goes in the key — the ESLint rule `exhaustive-deps` checks it
- The `queryFn` is a **closure** re-created at every render, but only called
  when the key's entry needs fetching: it must not read anything the key does
  not hold

```tsx
// ❌ `userId` is read but not in the key: user 2 gets user 1's issues from the cache
useQuery({ queryKey: ['issues'], queryFn: () => fetchIssuesOf(userId) });
// ✅
useQuery({ queryKey: ['issues', { userId }], queryFn: () => fetchIssuesOf(userId) });
```

---

# Stale props, stale closures — not here

```tsx
function IssueDetail({ id }: { id: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  useEffect(() => {
    fetchComments(id).then(setComments);   // id = 1 answers after id = 2…
  }, [id]);                                // …and shows the wrong comments
}
```

```tsx
function IssueDetail({ id }: { id: number }) {
  const { data: comments } = useQuery({
    queryKey: ['issues', 'detail', id, 'comments'],
    queryFn: () => fetchComments(id),
  });
}
```

- Each answer lands in the entry of **its own key**: a late answer for issue 1
  fills `[…, 1, 'comments']`, and the component reads `[…, 2, 'comments']`
- The `queryFn` of the render that **started** the fetch runs: its `id` is the
  one in the key — consistent by construction
- Don't copy `data` into `useState` "to edit it": you fork the cache, and the copy
  goes stale. Derive with `select`, or keep the draft separate

---
src: ../../tanstack-query-common/slides/01_queries/query-function.md
---

---

# Several queries at once — `useQueries`

```tsx
// A list of ids known at runtime: hooks cannot be called in a loop
const results = useQueries({
  queries: selectedIds.map((id) => issueQuery(id)),
  // Optional: merge the results into what the component needs
  combine: (results) => ({
    issues: results.map((result) => result.data).filter((issue) => issue !== undefined),
    isPending: results.some((result) => result.isPending),
  }),
});
```

- Two **fixed** queries: two `useQuery` calls — they start **in parallel**
- A **dynamic** number of queries: `useQueries` — never `useQuery` in a `.map()`
  (the rules of hooks)
- `combine` is memoised like `select`: the component re-renders when the
  combined value changes

---
src: ../../tanstack-query-common/slides/01_queries/statuses.md
---

---

# The flags, in JSX

```tsx
const { data: issues, isPending, isFetching, error } = useQuery(issuesQuery(filter));

return (
  <>
    {isFetching && !isPending && <span data-testid="list-refreshing">refreshing…</span>}
    {error ? (
      <p data-testid="list-error">{error.message}</p>
    ) : isPending ? (
      <p data-testid="list-loading">Loading…</p>
    ) : (
      <ul>{issues.map((issue) => <li key={issue.id}>{issue.title}</li>)}</ul>
    )}
  </>
);
```

- `isPending` — nothing to show **for this key**: a skeleton, a spinner
- `isFetching` — a request in flight, maybe behind data: a discreet hint
- Never `isLoading` for "nothing to show": in v5 it means
  `isPending && isFetching`, and is `false` for a disabled query

---

## Workshop 01 — First queries
