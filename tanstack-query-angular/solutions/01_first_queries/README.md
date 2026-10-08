# TP 01 — First queries

> The app works as shipped — it fetches its data the way most Angular apps
> start: `ngOnInit`, three signals and a `try` / `finally` per component. Hand
> the server state to TanStack Query, counting the requests at every step.

## Goal

Chapter 01 — Replace hand-rolled fetching with **`@tanstack/angular-query-experimental`**:

- **One client** for the whole app, with the devtools
- **One cache**: two components, the same key, one request
- **A key that follows a signal**: the filter
- **Fetching is not loading**: `isPending()` for "Loading…", `isFetching()` for
  "Refreshing…"

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 01 of the deck: query keys, key factories, `queryOptions`, `injectQuery`

## Setup

```bash
npm install
npm run dev          # http://localhost:4200
npm test             # ng test --watch=false — red on the starter
npm run test:watch   # ng test, in watch mode
npm run typecheck
```

The steps come with their spec already written:
**`src/tests/shared/workshop.spec.ts`** renders the whole app and reads two
things only — what the page shows, and `apiLog`, the requests the fake server
received. It is red on the starter; keep `npm run test:watch` in a second
terminal.

`src/api/` (the fake server and its Network panel) and `src/tests/shared/` (the
spec) are **shared copies**, written by the training's sync: read them, do not
edit them.

**Already done for you:**

- `@tanstack/angular-query-experimental` is in `package.json` — pinned to an
  exact version, because the adapter is *experimental* (breaking changes may
  come in a patch).
- `src/queryClient.ts` exports `createQueryClient()`. The app does not use it
  yet — but **`src/tests/render.ts` does**: the spec renders `App` with
  `provideTanStackQuery(createQueryClient())` in its providers. That is why the
  starter can be rendered by the spec at all, and why it is still red: the
  components ignore the client. Step 1 gives the same client to the real app.

**The bugs you are about to fix**, all visible on the page as shipped:

- Loading the page sends `GET /issues?status=open` **twice** — the list and the
  header counter each fetch their own copy. The Network panel shows it in red.
- Coming back to a filter you just left shows "Loading…" again, and refetches
  it from scratch.
- Set the latency to 3000 ms in the Network panel, click **closed** then **all**
  quickly: whichever answer comes back **last** wins — a race.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Provide the client and the devtools | `app/app.config.ts` | The devtools button shows in the app |
| 2 | A key factory, `issuesQuery(filter)`, and `injectQuery` in the counter and the list | `issues/issue-queries.ts`, `issues/open-count.ts`, `issues/issue-list.ts` | `npm test` — step 2 green: one `GET` for both |
| 3 | A key that follows the filter | `issues/issue-list.ts` | `npm test` — step 3 green, no race |
| 4 | `isPending()` vs `isFetching()` | `issues/issue-list.ts` | `npm test` — all green |

## Steps

### 1. One client for the app — `app/app.config.ts`

1. Add `provideTanStackQuery(createQueryClient(), withDevtools())` to the
   providers. `provideTanStackQuery` comes from `@tanstack/angular-query-experimental`,
   `withDevtools` from `@tanstack/angular-query-experimental/devtools`.
2. Nothing else changes yet: no component uses the client.

**Check it**: `npm run dev`. A TanStack flower button sits at the bottom of the
page, above the Network panel. Open it: the cache is empty — for now.

→ **Done when** the devtools open and list no query.

### 2. One cache — `issue-queries.ts`, `open-count.ts`, `issue-list.ts`

1. In `src/app/issues/issue-queries.ts`, write the key factory `issueKeys`:
   `all: ['issues']`, `lists: () => [...all, 'list']`,
   `list: (filter) => [...lists(), filter]` — each one `as const`.
2. Next to it, `issuesQuery(filter)`: it returns
   `queryOptions({ queryKey: issueKeys.list(filter), queryFn: () => fetchIssues(filter) })`.
   Key and fetcher travel together, and the type of `data` is inferred.
3. In `OpenCount`, replace the signal and `ngOnInit` with a field:
   `protected readonly openIssues = injectQuery(() => issuesQuery('open'));`
   — and read `openIssues.data()` in the template
   (`@if (openIssues.data(); as issues) { {{ issues.length }} open }`).
4. In `IssueList`, do the same with `issuesQuery('open')` for now: `issues`,
   `loading` and `error` become `issues.data()`, `issues.isPending()` and
   `issues.error()`. `ngOnInit`, `select` and `load` go.

Why a **field**? `injectQuery` calls `inject()` inside: it needs an injection
context, which a field initializer (or the constructor) has, and `ngOnInit` has not.

**Check it**: reload. The Network panel shows **one**
`GET /issues?status=open`, and the devtools one query, `["issues","list","open"]`,
with **two** observers.

→ **Done when** the step 2 spec is green.

### 3. A key that follows the filter — `issue-list.ts`

1. Pass the signal **inside** the options function:
   `injectQuery(() => issuesQuery(this.filter()))`. The function runs in a
   `computed`: reading `this.filter()` there makes the key follow the signal.
2. The filter buttons only need `(click)="filter.set(option)"` now.

**Check it**: switch `open → closed → all` with a latency of 3000 ms and click
fast: every answer lands in **its own** cache entry, so the screen always shows
the filter you are on. The devtools list one query per filter.

→ **Done when** the step 3 spec is green.

### 4. Fetching is not loading — `issue-list.ts`

1. `list-loading` ("Loading…") only while `issues.isPending()` — there is
   **nothing** to show for this key yet.
2. Add `<span data-testid="list-refreshing">` while
   `issues.isFetching() && !issues.isPending()` — a request in flight **behind**
   data already on screen.
3. Show `list-error` with `issues.error().message` under `@else if (issues.isError())`.

**Check it**: `open → closed → open`. Coming back to "open" shows the list at
once, and "Refreshing…" while it refetches in the background (`staleTime` is
still 0: the data is stale the moment it arrives — workshop 02 changes that).

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

- [ ] Loading the page sends **one** `GET /issues?status=open`, not two
- [ ] No component imports `fetchIssues`: it only appears in `issue-queries.ts`
- [ ] Coming back to a filter shows it at once, with "Refreshing…" — never "Loading…"
- [ ] With a 3000 ms latency, fast clicks between filters always end on the
      filter you clicked last
- [ ] The devtools list `["issues","list","open"]` with two observers

**You can explain**

- [ ] Why `injectQuery(() => issuesQuery(this.filter()))` follows the filter, and
      a value read outside the function does not
- [ ] Why `injectQuery` works in a field initializer and fails in `ngOnInit`
- [ ] The difference between `isPending()` and `isFetching()`, and which one each
      indicator uses
- [ ] Why the race of the starter is gone without any `switchMap` or cancellation

## Going further

- *(Bonus)* Show the counter with `select`: `injectQuery(() => ({ ...issuesQuery('open'), select: (issues) => issues.length }))`.
  Does it still share the request with the list?
- Read `src/tests/render.ts`: what would break if it built ONE client for all the
  tests instead of one per call?
- Replace `fetchIssues` by `HttpClient` in your head: `queryFn: ({ signal }) => lastValueFrom(http.get(…))`.
  How would you cancel the request when the query is cancelled?
