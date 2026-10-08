# Production checklist — the cache

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Setup

- [ ] One `QueryClient` per app, built by a **factory** — per test, per SSR
  request
- [ ] A **default `staleTime`** chosen, and per-resource overrides
- [ ] `retry` **by status**: no retry on 4xx
- [ ] A typed `defaultError` (`Register`)
- [ ] `QueryCache` / `MutationCache` `onError` for global toasts, 401s
- [ ] Devtools in development, lazy-loaded (or absent) in production

</div>
<div>

### Keys and options

- [ ] A **key factory** per resource, hierarchical (`all → lists → list`)
- [ ] **Everything** the `queryFn` reads is in the key
- [ ] `queryOptions` / `infiniteQueryOptions` factories — no inline keys
- [ ] The `queryFn` **throws** on HTTP errors, passes the `signal` where it
  matters
- [ ] `enabled` / `skipToken` for queries that wait for a parameter
- [ ] `select` for derived data — never a copy in local state

</div>
</div>

---

# Production checklist — the UI and the writes

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Reading

- [ ] Skeleton on **`isPending`**, discreet hint on **`isFetching`**
- [ ] Errors: inline for first loads, toast for background refetches
- [ ] `placeholderData: keepPreviousData` on paginated / filtered lists
- [ ] Partial data from a list → `placeholderData`, not `initialData`
- [ ] Prefetch on intent and in route loaders; no accidental waterfalls
- [ ] Infinite feeds: `hasNextPage`, `isFetchingNextPage`, `maxPages` if long

</div>
<div>

### Writing

- [ ] Every mutation **invalidates** (or `setQueryData`s) what it changes —
  broad prefixes over clever lists
- [ ] Cache logic in **options-level** callbacks, UI logic in **`mutate()`-level**
- [ ] Return the invalidation from `onSuccess` when the UI should wait for fresh
  data
- [ ] Optimistic: cancel → snapshot → write immutably → roll back → invalidate
  (not returned)
- [ ] A `mutationKey` on every mutation; `isPending` disables the trigger
- [ ] The error is **shown**, not only rolled back

</div>
</div>

---

# Production checklist — quality and scale

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Testing

- [ ] A fresh client per test, `retry: false`, `gcTime: Infinity`
- [ ] Assertions on the **page** and the **requests**, not on the cache
- [ ] The network faked (MSW / a fake server) rather than TanStack Query mocked
- [ ] Error, empty, pending and rollback paths covered
- [ ] `findBy*` / `waitFor` — never a fixed sleep

</div>
<div>

### Scale and performance

- [ ] Feature modules: API layer · queries module · components
- [ ] No per-endpoint wrapper hooks / composables / injectables that only hide
  options
- [ ] `gcTime` and `maxPages` for big or numerous entries
- [ ] `structuralSharing: false` only for huge, rarely refetched payloads
- [ ] SSR: hydrate, with `staleTime > 0` on the client
- [ ] Real-time: pushes update the cache with `setQueryData` / `invalidateQueries`

</div>
</div>

---

# The day in eight sentences

1. **Server state** is a borrowed copy: give it to a cache, keyed by **query keys**
2. A key holds **everything** the query function depends on; a **factory** and
   **`queryOptions`** keep keys and functions together, and typed
3. **Loading** means *nothing to show*; **fetching** means *a request in flight* —
   possibly behind data
4. **`staleTime`** decides when to trust, **`gcTime`** (ex-`cacheTime`) when to
   forget — stale data is still shown
5. **Paginated** = the page in the key + `keepPreviousData`; **infinite** = one
   entry, many pages, a cursor
6. **Mutations** change the server; **invalidation** brings every screen back
   in line
7. **Optimistic updates**: cancel, snapshot, write, roll back, invalidate
8. **Devtools** to see the cache, **tests** on behaviour, **defaults** and
   **feature modules** to scale — and the internals explain every rule above
