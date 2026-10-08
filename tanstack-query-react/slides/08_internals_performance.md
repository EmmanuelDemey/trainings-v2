---
layout: cover
---

# 08 - Internals and performance

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** what happens between `useQuery` and a re-render: `QueryClient`,
  `QueryCache`, `Query`, `QueryObserver`, `useSyncExternalStore`
- **Explain** why a component re-renders — tracked properties,
  `notifyOnChangeProps`, `select`, structural sharing
- **Measure** render counts and find the wasted ones
- **Check** a React Query app against a production checklist

---
src: ../../tanstack-query-common/slides/08_internals_performance/architecture.md
---

---

# The React adapter, in one picture

```ts
// What useQuery boils down to (simplified from useBaseQuery)
function useQuery(options) {
  const client = useQueryClient();
  const [observer] = useState(() => new QueryObserver(client, options));   // one per hook call
  const result = observer.getOptimisticResult(options);                    // computed during render

  useSyncExternalStore(
    useCallback((onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)), [observer]),
    () => observer.getCurrentResult(),
  );

  useEffect(() => { observer.setOptions(options); }, [options, observer]);
  return observer.trackResult(result);                                     // tracked properties
}
```

- **`useSyncExternalStore`**: the React 18+ primitive for external stores — no
  tearing in concurrent rendering
- **`notifyManager`** batches the notifications: ten queries resolving in the
  same tick, one render
- Everything else — fetching, retries, caching, timers — is in
  `@tanstack/query-core`, shared with Angular and Vue

---
src: ../../tanstack-query-common/slides/08_internals_performance/query-lifecycle.md
---

---
src: ../../tanstack-query-common/slides/08_internals_performance/performance.md
---

---

# Tracked properties, in React

```tsx
// Reads `data` only: re-renders when `data` changes — not on isFetching, not on failureCount
const { data } = useQuery(issuesQuery('open'));

// ❌ The rest spread reads EVERY property: re-renders on every change of the query
const { data: issues, ...rest } = useQuery(issuesQuery('open'));

// Explicit, when tracking cannot see what you read (a property read in an effect, later)
const query = useQuery({ ...issuesQuery('open'), notifyOnChangeProps: ['data', 'error'] });
```

- By default `useQuery` returns a **proxy** that records which properties the
  render read; the observer notifies the component only when one of **those** changes
- `notifyOnChangeProps: 'all'` turns it off — the v3 behaviour
- The ESLint rule `no-rest-destructuring` catches the spread
- `select` + structural sharing go further: the component re-renders only when
  the **selected** value changes

---

# Counting renders

```tsx
function IssueCounter() {
  const { data: count } = useQuery({ ...issuesQuery('open'), select: (issues) => issues.length });
  console.count('IssueCounter render');           // dev only — remove before committing
  return <span>{count ?? '…'} open</span>;
}
```

| What happens | without `select` | with `select` |
|---|---|---|
| The list is refetched, nothing changed | 0 | 0 — structural sharing |
| A refetch starts (`isFetching` — not read) | 0 | 0 — tracked properties |
| An issue is renamed | 1 | 0 — same count |
| An issue is closed | 1 | 1 |

- **React DevTools → Profiler**, "Record why each component rendered", and
  "Highlight updates when components render": see the renders the table predicts
- `<StrictMode>` doubles renders in development: count in a production build
  (`npm run build && npm run preview`) before optimising

<style>
table { font-size: 0.8em; }
</style>

---

# Performance in React — the usual suspects

- **A client created in a component**: a new cache at every render — `useState`
  or module level
- **Unstable `select` doing heavy work**: an inline arrow runs again at every
  render — hoist it or `useCallback`
- **Copying `data` into `useState`**: two sources of truth, one effect to sync
  them, one render more
- **One `useQuery` high in the tree, `data` passed down 5 levels**: every level
  re-renders. Call `useQuery` where the data is used: same key, same entry, no
  extra request
- **Long lists**: virtualise (`@tanstack/react-virtual`) — the cache is not the
  bottleneck, the DOM is
- **`useQueries` with `combine`**: return a stable shape, or every result change
  re-renders the parent

---
src: ../../tanstack-query-common/slides/08_internals_performance/checklist.md
---

---
src: ../../tanstack-query-common/slides/retro.md
---
