# Performance — the knobs, in order

1. **`staleTime`** — the first one. `0` refetches on every mount and focus:
   a list shown in 5 components, a tab switched 20 times an hour… Most "too many
   requests" reports end here
2. **`select`** — subscribe to the part you need; re-render only when **it**
   changes
3. **Tracked properties** — read only the fields you use
4. **Structural sharing** — keeps references stable; turn it off only for huge
   payloads
5. **Invalidation scope** — don't refetch the world after each write
6. **`gcTime`** — memory, for large or numerous entries
7. **Prefetching** — move the wait **before** the click
8. **Large lists** — `maxPages`, virtualisation, pagination on the server

<br />

> Measure first: the **Network panel** (how many requests?), the **devtools**
> (how many observers, how often fetching?), the framework's **profiler** (how
> many renders?).

---

# Render less: `select` and tracked properties

```ts
// The header only needs a number: it re-renders when the COUNT changes,
// not when a title of an open issue changes
{ ...issuesQuery('open'), select: (issues) => issues.length }

// Stable select: defined once, outside the component
const selectOpenCount = (issues: IssueSummary[]) => issues.length;
```

- **Tracked properties**: the observer records which fields of the result a
  component **reads** (`data`, `isFetching`…) and only notifies when one of
  **those** changes — a component that never reads `isFetching` is not
  re-rendered by a background refetch that returns equal data
- `notifyOnChangeProps: ['data', 'error']` fixes the list by hand;
  `'all'` disables the optimisation
- How each adapter exposes it differs (React tracks property access on the
  result object; signals and refs are fine-grained by nature) — the principle
  is the same: **read only what you render**
- Avoid spreading the whole result (`{ ...result }`) — it reads every property

---

# Big data, memory, and the network

<div style="display: flex; gap: 2em;">
<div>

### Structural sharing on huge payloads

```ts
queryOptions({
  queryKey: ['report', id],
  queryFn: () => fetchReport(id),     // 50 000 rows
  structuralSharing: false,
});
```

- `replaceEqualDeep` walks **the whole** tree on every fetch — costly for
  megabytes of JSON
- Off: every fetch is a new reference — fine if the data rarely refetches
- Or a function `(old, next) => …` for a custom comparison (e.g. by
  `version`)

</div>
<div>

### Memory: `gcTime`

- Every key visited stays **5 min** after its last use: a paginated table
  browsed to page 200 = 200 entries
- Lower `gcTime` for big, rarely revisited entries (`gcTime: 30_000`)
- `maxPages` for infinite queries
- `removeQueries` for what you know is dead (a deleted resource)

### The network: invalidation scope

- `invalidateQueries({ queryKey: ['issues'] })` refetches every **active**
  issue query — usually few
- `refetchType: 'all'` or `refetchQueries()` without filters: **everything**
  — avoid

</div>
</div>

<style>
.slidev-layout { --slidev-code-font-size: 11px; }
</style>

---

# Large lists and over-fetching

- **Paginate on the server**, then cache pages — not "fetch 5 000 rows and
  slice in the client"
- **Infinite + virtualisation** (TanStack Virtual): render 30 rows of 3 000,
  `maxPages` to cap memory and refetch cost
- **Normalisation is not built in**: the same issue lives in the list **and**
  the detail entry. Update both (or invalidate) — don't try to build a
  normalised store on top of the cache
- **Avoid N+1**: 50 rows each running its own detail query = 50 requests.
  Return what the row needs in the list endpoint; seed details from the list
  (`placeholderData`)
- **Don't put fast-changing UI values in the key** (a text input before
  debouncing): one cache entry and one request per keystroke — debounce first
- **Parallel by default**: independent queries start together; check the
  Network panel for accidental waterfalls

---

# Anti-patterns that cost the most

| Anti-pattern | Cost | Fix |
|---|---|---|
| `staleTime: 0` everywhere (the default) | a request per mount / focus | set a default `staleTime` |
| A spinner on `isFetching` | the page blanks on every background refetch | spinner on `isPending`, hint on `isFetching` |
| Copying `data` into local state / a store | a stale fork, double renders | read `data`, derive with `select` |
| `select: (d) => d.map(…)` recreated each render, expensive | `select` re-runs on every render | a stable function |
| Functions or class instances in the key | silently dropped from the hash: different requests share one entry | serialisable keys only |
| Invalidating `[]` (everything) after each mutation | refetch storm | invalidate the resource's prefix |
| `refetchInterval: 1000` on many queries | constant traffic, battery | push (SSE) or a longer interval |
| `retry: 3` on a 404 | 7 s spinner before "not found" | retry by status |

<style>
table { font-size: 0.75em; }
</style>
