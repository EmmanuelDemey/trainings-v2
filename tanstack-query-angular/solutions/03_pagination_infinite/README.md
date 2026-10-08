# TP 03 — Paginated and infinite queries

> Another screen of the tracker: every issue in a paged table, and the activity
> feed next to it. The table blinks at every page, and "Load more" does nothing.
> Make the table still, the next page instant, and the feed endless — until it ends.

## Goal

Chapter 03 — Two ways to read a list that does not fit in one request:

- **A paginated query**: the page in the key, `keepPreviousData` to keep the
  screen still, `isPlaceholderData()` to say so
- **Prefetching**: the next page is in the cache before the click
- **An infinite query**: `injectInfiniteQuery`, one cache entry for every page loaded

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 03 of the deck

## Setup

```bash
npm install
npm run dev          # http://localhost:4200
npm test             # ng test --watch=false — red on the starter
npm run test:watch
npm run typecheck
```

The spec is **`src/tests/shared/workshop.spec.ts`**; `src/api/` and
`src/tests/shared/` are shared copies: do not edit them. The client is already
provided (`app.config.ts`), with `staleTime: 30_000` (`queryClient.ts`).

**The API**: `fetchIssuePage(page)` → `GET /issues?page=2`, 10 issues per page,
5 pages, with `page`, `totalPages` and `items`. `fetchActivity(cursor)` →
`GET /activity?cursor=10`, 10 events at a time, newest first, with `nextCursor`
— `null` on the last page.

**The bugs you are about to fix**, all visible as shipped:

- Every click on **Next** empties the table and shows "Loading…": each page is a
  new key, with nothing in it yet.
- Each page is only requested when you click — a full round trip every time.
- **Load more** does nothing: the feed is a plain query for the first page.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `placeholderData: keepPreviousData`, and `isPlaceholderData()` | `issues/issue-table.ts` | The table stays while the next page loads; step 1 green |
| 2 | Prefetch the next page from an `effect()` | `issues/issue-table.ts` | `GET /issues?page=2` before any click; step 2 green |
| 3 | The feed as an infinite query | `activity/activity-queries.ts`, `activity/activity-feed.ts` | `npm test` — all green |

## Steps

### 1. A paginated query — `issue-table.ts`

1. Spread the options and add `placeholderData: keepPreviousData` (from
   `@tanstack/angular-query-experimental`):
   `injectQuery(() => ({ ...issuePageQuery(this.page()), placeholderData: keepPreviousData }))`.
   Until the new page lands, the query shows the last data it had:
   `isPending()` stays false, `isPlaceholderData()` is true.
2. Dim the table while `issues.isPlaceholderData()` (`[class.dimmed]`), and
   disable `page-next` too — otherwise fast clicks run `page()` ahead of the screen.
3. The indicator shows `current.page`, the page **on screen** — not `page()`,
   the page requested.

**Check it**: 3000 ms latency, click **Next**: page 1 stays, dimmed, for 3 seconds.

→ **Done when** the step 1 spec is green.

### 2. Prefetching — `issue-table.ts`

1. Add `private readonly queryClient = inject(QueryClient);`.
2. In the constructor, an `effect()`: read `this.issues.data()`; if there is a
   real page (not a placeholder) and a page after it, call
   `void this.queryClient.prefetchQuery(issuePageQuery(current.page + 1))`.

Why an `effect()` and not the click handler? The **data** decides: the first
load, the back button, any way of reaching a page — all prefetch the same. And
thanks to `staleTime`, `prefetchQuery` sends nothing for a page already fresh.

> In the installed `query-core` (5.104), `prefetchQuery` is marked **deprecated**
> in favour of `queryClient.query(options).catch(noop)` — same behaviour, a new
> name, removed in the next major only. The workshop keeps `prefetchQuery`, the
> name every article and the devtools still use; your editor will strike it through.

**Check it**: reload. `GET /issues?page=2` appears **before** you click; clicking
**Next** then sends nothing for page 2 — and prefetches page 3.

→ **Done when** the step 2 spec is green.

### 3. An infinite query — `activity-queries.ts`, `activity-feed.ts`

1. In `activity-queries.ts`, turn `activityFeedQuery()` into an
   `infiniteQueryOptions({ … })`: `queryFn: ({ pageParam }) => fetchActivity(pageParam)`,
   `initialPageParam: 0`, `getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined`.
   `undefined` — not `null` — is what means "no next page".
2. In `ActivityFeed`, `injectInfiniteQuery(() => activityFeedQuery())`.
3. The template loops over `feed.data().pages`, then over each page's `items`:
   two nested `@for`.
4. `load-more` calls `feed.fetchNextPage()`, is disabled while
   `feed.isFetchingNextPage()`, and is **absent** once `!feed.hasNextPage()`.
   Show `activity-loading-more` while `feed.isFetchingNextPage()`. `loadMore()` goes.

**Check it**: click **Load more** three times: 10, 20, 30, 34 events, then no
button. The devtools show **one** query, `["activity","feed"]`, whose data holds
`pages` and `pageParams`.

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src/app` returns nothing

**The behaviour is there**

- [ ] **Next** never empties the table; the previous page is dimmed while the next one loads
- [ ] The next page is requested before the click, and the click sends nothing
- [ ] The feed appends pages; the button disappears after the 34th event
- [ ] Each `GET /activity?cursor=…` is sent once

**You can explain**

- [ ] What `keepPreviousData` does to `isPending()` and `isPlaceholderData()`
- [ ] Why the prefetch lives in an `effect()` that reads the data
- [ ] A paginated query (one entry per page) vs an infinite query (one entry, many pages)
- [ ] Why `getNextPageParam` returns `undefined` and not `null`

## Going further

- *(Bonus)* `maxPages: 3` on the feed: load 4 pages, and look at the data in the
  devtools. What does `fetchPreviousPage` need then?
- Replace the button by infinite scroll: a small `[appInView]` directive with an
  `IntersectionObserver` that emits when a sentinel at the bottom shows up (see
  the deck). Keep the button for keyboard users.
- Invalidate the feed from the devtools: how many requests does a refetch of an
  infinite query with 3 pages send, and in what order?
