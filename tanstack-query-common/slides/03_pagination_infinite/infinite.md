# Infinite queries — one entry, many pages

A feed with *Load more*: the pages are **accumulated** on screen, and each page
needs the **cursor** returned by the previous one.

```ts
import { infiniteQueryOptions } from '@tanstack/query-core';   // re-exported by every adapter

export const activityKeys = {
  all: ['activity'] as const,
  feed: () => [...activityKeys.all, 'feed'] as const,
};

export const activityFeedQuery = infiniteQueryOptions({
  queryKey: activityKeys.feed(),
  queryFn: ({ pageParam }) => fetchActivity(pageParam),   // pageParam: number
  initialPageParam: 0,                                     // required in v5
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
```

- **One** cache entry for the whole feed — not one per page
- The adapter's **infinite** query function (`useInfiniteQuery` /
  `injectInfiniteQuery`) consumes these options
- `getNextPageParam` returns `undefined` (or `null`) when there is **no next page**

---

# The data shape

```ts
type InfiniteData<TPage, TPageParam> = {
  pages: TPage[];          // every page loaded so far, in order
  pageParams: TPageParam[];  // the param each page was fetched with
};
```

```ts
// After two clicks on "Load more"
{
  pages: [
    { items: [/* ids 34 → 25 */], nextCursor: 10 },
    { items: [/* ids 24 → 15 */], nextCursor: 20 },
    { items: [/* ids 14 → 5  */], nextCursor: 30 },
  ],
  pageParams: [0, 10, 20],
}
```

- Render with `data.pages.flatMap((page) => page.items)` — or flatten once with
  `select`
- `pageParams` is how the cache knows which params to refetch with
- `setQueryData` on an infinite key must keep this **shape**: write
  `{ ...old, pages: old.pages.map(…) }`, never a flat array

---

# What the infinite result adds

| Field | Means |
|---|---|
| `fetchNextPage()` | fetch the page after the last one, using `getNextPageParam(lastPage, allPages, lastPageParam, allPageParams)` |
| `hasNextPage` | `getNextPageParam` returned something other than `undefined` / `null` |
| `isFetchingNextPage` | a `fetchNextPage` is in flight — the *"loading more"* indicator |
| `fetchPreviousPage()`, `hasPreviousPage`, `isFetchingPreviousPage` | the same, backwards, with `getPreviousPageParam` |
| `isFetchNextPageError` / `isFetchPreviousPageError` | loading **one more** page failed — the pages already loaded stay |

<br />

| UI element | Flag |
|---|---|
| The feed skeleton (nothing yet) | `isPending` |
| `load-more` button **rendered** | `hasNextPage` |
| `load-more` **disabled** | `isFetchingNextPage` (or `isFetching`) |
| `activity-loading-more` | `isFetchingNextPage` |
| A background refresh hint | `isFetching && !isFetchingNextPage` |

<style>
table { font-size: 0.8em; }
</style>

---

# Refetching an infinite query

```text
stale feed with 3 pages, window focus
  ─▶ GET /activity?cursor=0    page 1 (pageParams[0])
  ─▶ GET /activity?cursor=10   page 2 (getNextPageParam(new page 1))
  ─▶ GET /activity?cursor=20   page 3 (getNextPageParam(new page 2))
  ─▶ ONE cache write, all pages replaced together
```

- A refetch (focus, invalidation, `refetch()`) re-fetches **every loaded page,
  in sequence**, starting from the first — so a new event at the top does not
  duplicate or skip items across pages
- Ten loaded pages = **ten sequential requests** on every refetch
- `fetchNextPage()` while a refetch runs: by default it **cancels** the running
  fetch (`cancelRefetch: true`); for an intersection observer, guard with
  `hasNextPage && !isFetching`

---

# `maxPages`

```ts
export const activityFeedQuery = infiniteQueryOptions({
  queryKey: activityKeys.feed(),
  queryFn: ({ pageParam }) => fetchActivity(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  getPreviousPageParam: (_firstPage, _all, firstPageParam) =>
    firstPageParam > 0 ? Math.max(0, firstPageParam - 10) : undefined,
  maxPages: 3,
});
```

- Keeps at most **3 pages** in the cache: loading a 4th **drops the first**
- Bounds **memory**, DOM size, and the cost of a refetch (3 requests, not 30)
- Give it a `getPreviousPageParam` too, so the user can scroll **back** to the
  dropped pages
- Ideal for a virtualised infinite list; pointless for a short feed

---

# "Load more" or infinite scroll?

<div style="display: flex; gap: 2em;">
<div>

### A *Load more* button

- `onClick → fetchNextPage()`
- Explicit, accessible, keeps the **footer** reachable
- Rendered only while `hasNextPage` — workshop 03's `load-more` is **absent**
  at the end

</div>
<div>

### Infinite scroll

- An `IntersectionObserver` on a sentinel at the bottom of the list:

```ts
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting && hasNextPage && !isFetching) {
    void fetchNextPage();
  }
});
observer.observe(sentinel);
```

- Disconnect it on unmount; add a button fallback for keyboard users

</div>
</div>

<br />

- Both drive the **same** infinite query — the choice is UX, not data
- Very long lists: combine with **virtualisation** (TanStack Virtual) and `maxPages`
