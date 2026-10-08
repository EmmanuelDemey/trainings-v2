# Prefetching — fetch before the user asks

```ts
// On intent: the pointer enters a row, the detail will probably be opened
function onRowPointerEnter(id: number) {
  void queryClient.prefetchQuery(issueQuery(id));
}
```

- `prefetchQuery` fetches **if missing or stale**, caches the result, **never
  throws**, resolves to nothing
- 100–300 ms between hover and click: often enough to make the detail
  **instant**
- The entry has no observer yet: it is **inactive**, `gcTime` runs — prefetch
  what is likely to be used **soon**
- Give the query a `staleTime`, or the prefetched data is stale at once and
  refetched on mount (wasted request)
- Recent 5.x: `prefetchQuery` is deprecated in favour of
  `queryClient.query(options).catch(noop)` — same behaviour, explicit about the
  swallowed error

---

# Prefetching in the router

```ts
// A route loader / resolver / guard — whatever your router calls before rendering
async function issueRouteLoader(id: number) {
  // Ensure the detail is in the cache: returns cached data at once if present,
  // fetches (and THROWS on error) otherwise
  await queryClient.ensureQueryData(issueQuery(id));

  // Nice to have — don't block the navigation on it
  void queryClient.prefetchQuery(activityFeedQuery);
}
```

| | Returns | Throws | Fetches when |
|---|---|---|---|
| `prefetchQuery` | `void` | never | missing or stale |
| `ensureQueryData` | the data | yes | **missing** only (`revalidateIfStale` to refresh) |
| `fetchQuery` | the data | yes | missing or stale |
| `query` (recent 5.x) | the data | yes | missing or stale — replaces `fetchQuery`; with `staleTime: 'static'`, replaces `ensureQueryData` |

- The component then reads the **same** options through the adapter: the data
  is already there, no loading state
- The router decides **what** to load; the cache decides **whether** to fetch

<style>
table { font-size: 0.8em; }
</style>

---

# Avoiding waterfalls

```text
waterfall                                           parallel
───────────                                         ────────
Page renders ─▶ GET /issues/7                       loader ─┬▶ GET /issues/7
   detail renders ─▶ GET /activity?issue=7                  └▶ GET /activity?issue=7
      comments render ─▶ GET /comments?issue=7      page renders with both
1200 ms                                             400 ms
```

- A waterfall appears when each component **discovers** its data only once its
  parent has rendered with data
- Fixes, from simplest:
  1. **Hoist** the requests: start them in the route loader, or in the parent
  2. **Parallel queries**: several independent queries in one component start
     **together** (`useQueries` / `injectQueries` for a dynamic list)
  3. **Prefetch** children's queries where the parent's request starts
  4. Ask the **API** for an aggregated endpoint
- Dependent queries (`enabled: !!user`) are waterfalls **by design** — keep them
  for real dependencies

---

# Suspense — the concept

- With **Suspense**, a component that needs data **suspends** instead of
  returning `isPending`; the nearest boundary shows **one** fallback for the
  whole subtree
- Errors are thrown to the nearest **error boundary**
- The data is then **always defined** in the component: no `if (isPending)`
- Supported by React (`useSuspenseQuery`) and Vue (`suspense()` +
  `<Suspense>`); Angular has its own mechanisms (`@defer`, resolvers)
- ⚠️ Suspense makes waterfalls **easier** to create: two suspending queries in
  one component fetch **one after the other** — prefetch them, or use the
  multi-query variant

> Same cache, same options, same keys: Suspense changes **how the UI waits**,
> not how TanStack Query fetches.
