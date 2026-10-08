# Workshop 03 — Paginated and infinite queries

> Two lists that grow past one screen: a table of every issue, 10 per page, and
> an activity feed loaded on a cursor. Make the table stop flashing, make the
> next page instant, and turn the feed into one infinite query.

## Goal

Chapter 03 — Two ways to split a list:

- **A paginated query**: one query per page, and `placeholderData: keepPreviousData`
  so the previous page stays on screen while the next one loads
- **Prefetching**: the next page is in the cache before the user asks for it
- **An infinite query**: ONE query whose data is every page loaded so far,
  driven by `getNextPageParam`

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 03 of the deck

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch
npm run typecheck
```

The spec, **`src/tests/shared/workshop.spec.ts`**, is red on the starter.

> `src/api/` and `src/tests/shared/` are **shared copies**: do not edit them.

**Already done for you**: the client has `staleTime: 30_000` (workshop 02),
`issuePageQuery(page)` in `src/queries/issues.ts` (key `['issues', 'page', n]`,
fetcher `fetchIssuePage(n)`), and `activityKeys` in `src/queries/activity.ts`.

**The bugs you are about to fix**, all visible on the page as shipped:

- Every click on **Next** empties the table and shows "Loading…" for a round trip.
- Every click on **Next** waits for the server — though the user's next move was
  easy to guess.
- **Load more** does nothing: the feed is a plain query for the first page.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `placeholderData: keepPreviousData`, and `isPlaceholderData` | `IssueTable.tsx` | `npm test` — step 1 green: page 1 stays until page 2 lands |
| 2 | Prefetch the next page | `IssueTable.tsx` | `npm test` — step 2 green: the click sends nothing |
| 3 | The feed as `useInfiniteQuery` | `queries/activity.ts`, `ActivityFeed.tsx` | `npm test` — all green |

## Steps

### 1. Keep the previous page — `IssueTable.tsx`

Page 2 is a **new key**: for TanStack Query it is a query that has never run, so
`data` is `undefined` until it arrives.

1. Call `useQuery({ ...issuePageQuery(page), placeholderData: keepPreviousData })`.
   While page 2 loads, `data` is still page 1, and `isPlaceholderData` is `true`.
2. Read `isPlaceholderData` too: add the `dimmed` class to the table while it is
   true, and disable **Next** — while the previous page stands in, you do not know
   yet whether there is a next one.

**Check it**: latency 1500 ms, click **Next**. Page 1 stays, dimmed, then page 2
replaces it. The page indicator moves at once: it reads the `page` state, not
`data.page`.

→ **Done when** the step 1 spec is green.

### 2. The next page before the click — `IssueTable.tsx`

1. `const queryClient = useQueryClient();`
2. In a `useEffect`, as soon as a page is **really** on screen
   (`!isPlaceholderData`) and there is a next one, call
   `queryClient.prefetchQuery(issuePageQuery(page + 1))`. Dependencies:
   `[queryClient, page, hasNext, isPlaceholderData]`.

`prefetchQuery` fetches only if the query is missing or stale, never throws, and
returns nothing to render: it just fills the cache. Because the prefetched page is
fresh for 30 s, the `useQuery` of the next render finds it and sends nothing.

> TanStack Query 5.104 marks `prefetchQuery` as **deprecated**, in favour of
> `queryClient.query(options).catch(noop)` — same behaviour, explicit about the
> swallowed error. It still works, and you will meet it in every codebase for
> years: the workshop keeps it.

**Check it**: reload — the Network panel shows `GET /issues?page=2` without any
click. Click **Next**: page 2 shows at once, and `GET /issues?page=3` goes out.

→ **Done when** the step 2 spec is green.

### 3. One infinite query — `queries/activity.ts`, `ActivityFeed.tsx`

1. In `queries/activity.ts`, replace `activityFirstPageQuery` with:

   ```ts
   export const activityFeedQuery = infiniteQueryOptions({
     queryKey: activityKeys.feed(),
     queryFn: ({ pageParam }) => fetchActivity(pageParam),
     initialPageParam: 0,
     getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
   });
   ```

   `undefined` means "no next page". The API says it with `null` — which
   TanStack Query would take for a real cursor: hence `?? undefined`.
2. In `ActivityFeed.tsx`, `useInfiniteQuery(activityFeedQuery)`. Render
   `data.pages.flatMap((page) => page.items)`.
3. **Load more** calls `fetchNextPage()`, is shown only while `hasNextPage`, and is
   disabled while `isFetchingNextPage`. Show `activity-loading-more` while
   `isFetchingNextPage`.

**Check it**: click **Load more** three times: 10, 20, 30, 34 events — and the
button is gone. In the devtools, ONE query `["activity","feed"]`, whose data has
`pages` and `pageParams` (`[0, 10, 20, 30]`).

→ **Done when** `npm test` is fully green.

### 4. *(Bonus)* `maxPages`

Add `maxPages: 2` to the infinite query, load four pages, and look at the data in
the devtools: what was dropped, and what happens to the screen? What would
`getPreviousPageParam` add?

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] **Next** never empties the table
- [ ] The next page is requested before the click, and the click sends nothing
- [ ] The feed appends pages, and **Load more** disappears after the last one
- [ ] Each `GET /activity?cursor=…` is sent once

**You can explain**

- [ ] Why page 2 has no data without `keepPreviousData`, though page 1 is right
      there in the cache
- [ ] Why the prefetched page is not fetched again by `useQuery`
- [ ] The difference between N paginated queries and one infinite query — what
      happens to each when it is invalidated
- [ ] Why `getNextPageParam` returns `undefined`, not `null`

## Going further

- Invalidate the feed (`queryClient.invalidateQueries({ queryKey: activityKeys.all })`
  from a button) after loading three pages, and count the requests in the panel:
  an infinite query refetches **every** page, in order. Why?
- Replace the **Load more** button by an `IntersectionObserver` on the last item.
- Prefetch on hover instead of on render: `onMouseEnter` on **Next**. Which one
  would you choose on a mobile app?
