# Workshop 03 — Paginated and infinite queries

> Two lists that grow: a table of every issue, ten per page, and an activity
> feed loaded on a cursor. The table flashes at every click, and "Load more"
> does nothing. Make paging seamless, and the feed infinite.

## Goal

Chapter 03 — Paginated and infinite queries:

- **`placeholderData: keepPreviousData`** and **`isPlaceholderData`**: no empty
  table between two pages
- **`prefetchQuery`**: the next page is in the cache before the click
- **`useInfiniteQuery`**: one query for the whole feed, `fetchNextPage`,
  `hasNextPage`, `isFetchingNextPage`

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 03 of the deck. This workshop is a page of its own; its client has
  the `staleTime: 30_000` of workshop 02.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch
npm run typecheck    # vue-tsc --noEmit
```

**Do not edit** `src/api/` nor `src/tests/shared/`: copies of
`tanstack-query-common/`, shared with the React and Angular trainings. The
spec renders your app through `src/tests/render.ts`.

The test ids:

| Test id | What |
|---|---|
| `issue-<id>` | one row of the table |
| `page-prev`, `page-next` | the pagination buttons |
| `page-indicator` | "Page 1 / 5" |
| `issues-loading` | the table has nothing to show |
| `activity-<id>` | one event of the feed |
| `load-more` | the "Load more" button — **absent** when there is nothing more to load |
| `activity-loading-more` | the next page of the feed is loading |

The API: `fetchIssuePage(page)` answers `{ items, page, pageSize, total, totalPages }`
(42 issues, 5 pages); `fetchActivity(cursor)` answers `{ items, nextCursor }`
— 34 events, newest first, `nextCursor` is `null` on the last page.

**The bugs you are about to fix**:

- Every click on **Next** empties the table and flashes "Loading…": each page is
  a new key, so a new query with nothing in it.
- **Next** always waits for a round trip.
- **Load more** does nothing: the feed is a plain query of its first page.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `keepPreviousData`, `isPlaceholderData` | `IssuesTable.vue` | Page 1 stays until page 2 lands — spec "step 1" green |
| 2 | Prefetch the next page | `IssuesTable.vue` | `GET /issues?page=2` before any click — spec "step 2" green |
| 3 | The feed with `useInfiniteQuery` | `queries/activity.ts`, `ActivityFeed.vue` | `npm test` all green |

## Steps

### 1. Keep the previous page — `IssuesTable.vue`

```ts
const { data, isPending, isPlaceholderData, isFetching, error } = useQuery(() => ({
  ...issuePageQuery(page.value),
  placeholderData: keepPreviousData,
}));
```

While page 3 is on its way, `data` is still page 2, and `isPlaceholderData` is
`true`. Use it:

- dim the table (`:class="{ dimmed: isPlaceholderData }"` — the class exists);
- disable `page-next` while it is true: "Next" means after the page you
  **see**, not after one still on its way.

Mind the indicator: `data?.page` is the page on screen, `page` the one asked
for. Which one should "Page 2 / 5" show?

**Check it**: latency at 1500 ms, click **Next**: page 1 stays, dimmed, then
page 2 replaces it. No "Loading…".

→ **Done when** the spec "step 1 — a paginated query" is green.

### 2. Prefetch the next page — `IssuesTable.vue`

As soon as a page is **on screen**, fetch the next one into the cache:

```ts
const queryClient = useQueryClient();

watch(
  data,
  (current) => {
    if (current && current.page < current.totalPages) {
      void queryClient.prefetchQuery(issuePageQuery(current.page + 1));
    }
  },
  { immediate: true },
);
```

`prefetchQuery` respects `staleTime`: a page already fresh is not fetched
again. It never throws and returns nothing useful — hence the `void`.

> **Deprecated, still fine today.** In TanStack Query 5.10x, `prefetchQuery`,
> `fetchQuery` and `ensureQueryData` are marked `@deprecated` (your editor
> strikes them through) in favour of `queryClient.query(options)` — removed in
> the next major. The equivalent of the prefetch above is
> `void queryClient.query(issuePageQuery(n)).catch(() => {})`. The workshop keeps
> `prefetchQuery`, the name every article and the other two trainings use.

**Check it**: reload. `GET /issues?page=2` leaves right after page 1 lands,
before any click. Click **Next**: page 2 shows at once, and the Network panel
shows `GET /issues?page=3` — the prefetch of the page after.

→ **Done when** the spec "step 2 — prefetching" is green.

### 3. An infinite feed — `queries/activity.ts`, `ActivityFeed.vue`

1. In `src/queries/activity.ts`, replace `activityFirstPageQuery` with
   `activityFeedQuery()`, built with `infiniteQueryOptions`:

   ```ts
   export function activityFeedQuery() {
     return infiniteQueryOptions({
       queryKey: activityKeys.feed(),
       queryFn: ({ pageParam }) => fetchActivity(pageParam),
       initialPageParam: 0,
       getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
     });
   }
   ```

   `undefined` means "no next page" — the server says `null`: translate it.
2. In `ActivityFeed.vue`, `useInfiniteQuery(activityFeedQuery())`. Its `data`
   is `{ pages, pageParams }`: the events are
   `data.value?.pages.flatMap((page) => page.items) ?? []`, in a `computed`.
3. Wire `load-more`: `fetchNextPage()` on click (a function, not a ref — no
   `.value`), rendered only while `hasNextPage`, disabled while
   `isFetchingNextPage`, and `activity-loading-more` shown meanwhile.

**Check it**: click **Load more** three times: 10, 20, 30, then 34 events, and
the button disappears. In the devtools, **one** query, `["activity","feed"]`,
holding four pages.

→ **Done when** `npm test` is all green.

### 4. *(Bonus)* `maxPages`

Add `maxPages: 2` to the feed: load three pages and look at the devtools. What
happens to the first one? What would you need to scroll back up
(`getPreviousPageParam`)?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No Vue warning in the browser console

**The behaviour is there**

- [ ] Paging never empties the table, and "Next" is disabled while the next
      page is a placeholder
- [ ] Each page is requested once, before its click
- [ ] The feed loads 10 events at a time, and "Load more" disappears after 34
- [ ] The devtools show one query per page, and one query for the whole feed

**You can explain**

- [ ] What `isPlaceholderData` tells you that `isFetching` does not
- [ ] Why the prefetch watches `data` (the page shown) and not `page` (the page
      asked for)
- [ ] Why the feed is ONE query with many pages, and the table one query per page
- [ ] What happens to the four pages of the feed when it is invalidated

## Going further

- Infinite scroll instead of a button: an `IntersectionObserver` on a sentinel
  at the end of the list, or `useIntersectionObserver` from VueUse, calling
  `fetchNextPage()` while `hasNextPage && !isFetchingNextPage`.
- Prefetch on hover: `@mouseenter` on `page-next`, rather than as soon as a
  page shows. Which one sends fewer useless requests?
- Keep the current page in the URL (`?page=3`) with vue-router: the key follows
  the route.
