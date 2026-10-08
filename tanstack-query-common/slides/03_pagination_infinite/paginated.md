# Paginated queries — the page goes in the key

```ts
// GET /issues?page=2 → { items, page, pageSize, total, totalPages }
export const issuePageQuery = (page: number) =>
  queryOptions({
    queryKey: issueKeys.page(page),          // ['issues', 'page', 2]
    queryFn: () => fetchIssuePage(page),
  });
```

- Nothing special: a paginated query is a **normal query** whose key holds the
  page — one cache entry **per page**
- Going back to page 1 is **instant** (cached), and refetched if stale
- Filters, sort and page size go in the key too — `['issues', 'page', { page, status, sort }]`

**The problem:** clicking *Next* changes the key → a **new** entry, empty →
`isPending` → the table **empties** for a full round trip, then refills. The
pagination bar jumps, the user loses their place.

---

# `placeholderData: keepPreviousData`

```ts
import { keepPreviousData } from '@tanstack/query-core';   // re-exported by every adapter

export const issuePageQuery = (page: number) =>
  queryOptions({
    queryKey: issueKeys.page(page),
    queryFn: () => fetchIssuePage(page),
    placeholderData: keepPreviousData,
  });
```

```text
            click "Next" (page 1 → 2)                 page 2 arrives
data        page 1's items (placeholder)        ──▶   page 2's items
status      success                                   success
isPlaceholderData  true                         ──▶   false
isFetching  true                                ──▶   false
isPending   false   ← no skeleton, no empty table
```

- The previous page **stays on screen** while the next loads — dim it with
  `isPlaceholderData`
- Disable *Next* while `isPlaceholderData`: otherwise a fast double-click
  computes page 3 from page 1's data
- v4 had `keepPreviousData: true`; v5 folded it into `placeholderData`

---

# Fetching vs loading, revisited

| Moment | `isPending` | `isFetching` | `isPlaceholderData` | Table shows |
|---|---|---|---|---|
| First visit, page 1 | **true** | true | false | `issues-loading` |
| Page 1 shown | false | false | false | page 1 |
| *Next* → page 2, not cached | false | **true** | **true** | page 1, dimmed |
| Page 2 arrived | false | false | false | page 2 |
| *Previous* → page 1, cached & stale | false | **true** | false | page 1 at once, refreshed silently |
| *Previous* → page 1, cached & fresh | false | false | false | page 1, no request |

<br />

- `isPending` is only true when there is **nothing at all** to show
- "Page 2 / 5" must come from the data you **show** — with
  `isPlaceholderData`, that is still page 1's `page` field: decide what the
  indicator means while loading

<style>
table { font-size: 0.8em; }
</style>

---

# Prefetching the next page

```ts
// As soon as page N is shown, warm the cache for page N + 1
function prefetchNext(queryClient: QueryClient, data: Page<IssueSummary>) {
  if (data.page < data.totalPages) {
    void queryClient.prefetchQuery(issuePageQuery(data.page + 1));
  }
}
```

- `prefetchQuery` fetches **only if** the entry is missing or stale, never
  throws, returns nothing — *fire and forget*
- *Next* then hits a **fresh** entry: no placeholder, no request, instant
- Prefetched data obeys `staleTime`: with `staleTime: 0` it is stale at once
  and refetched when the page mounts — give the query a `staleTime`
- Without observer, a prefetched entry is **inactive**: `gcTime` starts at once
- Recent 5.x releases deprecate `prefetchQuery` in favour of
  `queryClient.query(options).catch(noop)` — same effect; the workshops use
  `prefetchQuery`, still fully supported in v5

> Where to call it: an effect / `effect()` / `watch` on the shown page, a
> router loader, `onMouseEnter` on the *Next* button. The training shows its own.

---

# Offset vs cursor pagination

<div style="display: flex; gap: 2em;">
<div>

### Offset / page number

`GET /issues?page=3&pageSize=10`

- Jump to **any** page, show "Page 3 / 5"
- Rows **shift** when items are added or removed: duplicates or gaps between
  pages
- `OFFSET` gets slow on big tables
- ➜ admin tables, search results with page numbers

</div>
<div>

### Cursor

`GET /activity?cursor=10` → `{ items, nextCursor }`

- Only *next* (and maybe *previous*): no "page 3 / 5"
- **Stable** under inserts: the cursor points to an item, not a position
- Constant cost for the database
- ➜ feeds, timelines, logs, infinite scroll

</div>
</div>

<br />

- Both fit a paginated query (page / cursor in the key)
- A cursor almost always comes with an **infinite** query: you cannot compute
  page 3's cursor without having loaded page 2
