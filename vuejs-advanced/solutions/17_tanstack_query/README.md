# TP 17 — TanStack Query

> This TP is **autonomous**: it does not depend on any other TP. The app works as
> shipped — it fetches its data the way most apps start: `onMounted`, three refs
> and a `try` / `finally` per component. Your job is to hand the server state to
> a query layer, counting requests at every step.

## Goal

Chapter 17 — Replace hand-rolled fetching with **`@tanstack/vue-query`**:

- **One cache** for the whole app: two components, same key, one request
- **A reactive key** that follows a filter, and a `staleTime` that makes coming
  back to a filter free
- **A mutation that invalidates**, so a component nobody told about the change
  refreshes anyway
- **An optimistic update**, with the rollback that makes it safe

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The **Vue Devtools** browser extension — once the plugin is installed, it
  gets a **Vue Query** inspector listing every query, its key and its state

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The four steps come with their specs already written: **`tests/issues.spec.ts`**
mounts the whole app and reads two things only — what the page shows, and
`apiLog`, the list of requests the fake server received. It is red on the
skeleton; keep `npm run test:watch` in a second terminal.

The fake API (`src/api/fakeApi.ts`) answers after **400 ms**, and the
**Network** panel at the bottom of the page counts every request it received. A
`GET` sent more than once shows up in red. That panel is your instrument: read it
before and after each step.

**Already done for you**, in `src/queries/issues.ts`: the **key factory**
`issueKeys`. Every key the app uses starts with `['issues']` — which is what lets
one invalidation hit every list at once.

**The bugs you are about to fix**, all visible on the page as shipped:

- Loading the page sends `GET /issues?status=open` **twice** — the list and the
  header counter each fetch their own copy.
- Going back to a filter you just left refetches it, with a "Loading…" flash.
- Creating an issue refreshes the list, but the header counter **keeps lying**
  until you reload the page.
- Closing an issue takes a full round-trip before anything moves.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Install the plugin, write `issuesQuery`, move the counter to `useQuery` | `queryClient.ts`, `main.ts`, `queries/issues.ts`, `IssueCounter.vue` | The counter shows `3 open`, and its query is in the devtools |
| 2 | Move the list to `useQuery`, with a key that follows the filter | `IssueList.vue` | `npm test` — one `GET` for the open issues on load, none when you come back |
| 3 | Create an issue with `useMutation`, and invalidate | `queries/issues.ts`, `NewIssueForm.vue`, `IssueList.vue` | `npm test` — the counter says `4 open` after a creation |
| 4 | Close an issue optimistically, and roll back on failure | `queries/issues.ts`, `IssueList.vue` | `npm test` — all green |

## Steps

### 1. One cache — `queryClient.ts`, `main.ts`, `queries/issues.ts`, `IssueCounter.vue`

1. In `src/queryClient.ts`, give the queries a `staleTime` of 30 seconds in
   `defaultOptions`. The specs build their client with this same function.
2. In `src/main.ts`, install `VueQueryPlugin` with `{ queryClient: createQueryClient() }`.
3. In `src/queries/issues.ts`, write `issuesQuery(filter)`: it returns
   `queryOptions({ queryKey: issueKeys.list(filter), queryFn: () => fetchIssues(filter) })`.
   Key and fetcher travel together — no component can pair a key with the wrong
   fetcher, and the type of `data` is inferred from `queryFn`.
4. In `IssueCounter.vue`, replace the hand-rolled fetch with
   `useQuery({ ...issuesQuery('open'), select: (issues) => issues.length })`.

The counter now asks for `['issues', 'open']`, which the list does not use yet:
the Network panel still shows two requests. Step 2 brings them together.

**Check it**: open the **Vue Query** inspector in the Vue Devtools and find
`["issues","open"]` in it.

→ **Done when** the app runs, the counter shows `3 open`, and the query appears
in the devtools inspector.

### 2. A key that follows the filter — `IssueList.vue`

1. Replace `issues`, `loading`, `loadError` and `load()` with
   `useQuery(() => issuesQuery(filter.value))`. Mind the **arrow**: it is a
   getter, read again whenever `filter` changes. `useQuery(issuesQuery(filter.value))`
   would read the filter **once**, at setup, and never refetch.
2. Map the template to what `useQuery` returns: `data`, `isPending` (nothing to
   show yet), `isFetching` (a request in flight, even behind cached data) and
   `error`.
3. Add `placeholderData: keepPreviousData` to the options, and switch to a
   filter you never opened: the previous list stays on screen instead of an
   empty page.

**Check it**: reload, switch `open → closed → open` and read the Network panel.
One `GET` per filter, and none when you come back.

→ **Done when** the step 1 and step 2 specs are green: one request for the open
issues on load, and none when you come back to a filter.

### 3. A mutation that invalidates — `queries/issues.ts`, `NewIssueForm.vue`

1. Write `useCreateIssue()` in `src/queries/issues.ts`: a `useMutation` whose
   `mutationFn` is `createIssue`, and whose `onSuccess` **returns**
   `queryClient.invalidateQueries({ queryKey: issueKeys.all })`. Returning the
   promise keeps the mutation pending until the lists have refetched, so the
   button stays disabled until the new issue is on screen.
2. In `NewIssueForm.vue`, use `mutate`, `isPending` and `error`. Clear the input
   in the `onSuccess` of `mutate(title, { onSuccess })`.
3. Delete the `created` event and its `@created` listener in `IssueList.vue`:
   nobody needs to be told any more.

**Check it**: create an issue and watch the counter in the header change —
a component the form knows nothing about.

→ **Done when** the step 3 spec is green, and neither `NewIssueForm` nor
`IssueList` declares or listens to a `created` event.

### 4. An optimistic update — `queries/issues.ts`, `IssueList.vue`

Write `useSetIssueStatus()`, a `useMutation` around `setIssueStatus`, with the
three callbacks of an optimistic update:

1. **`onMutate`** — `await queryClient.cancelQueries({ queryKey: issueKeys.all })`
   first, so a refetch already in flight cannot land after your write. Take a
   snapshot with `getQueriesData<Issue[]>({ queryKey: issueKeys.all })`, then
   write the new status into every cached list with `setQueryData`. In an
   `'open'` or `'closed'` list, the issue that no longer matches has to leave.
   Return `{ snapshot }`.
2. **`onError`** — put every list of the snapshot back. The snapshot arrives as
   the third argument.
3. **`onSettled`** — invalidate `issueKeys.all`, success or failure. This time,
   do **not** return the promise. The screen is already right (or rolled back),
   and returning it keeps the mutation `pending` — its error hidden — until the
   refetch comes back.

Then use it in `IssueList.vue`, and delete `toggleError`, `pendingId` and
`toggle`'s `try` / `catch`.

**Check it**: close an issue — it leaves the list and the counter drops at once.
Then tick **The server refuses status changes** in the Network panel and try
again: the issue leaves, comes back, and the error shows.

→ **Done when** `npm test` is fully green.

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

- [ ] Loading the page sends **one** `GET /issues?status=open`, not two
- [ ] Switching `open → closed → open` sends one `GET` per filter, and nothing
      when you come back
- [ ] No component imports `fetchIssues`, `createIssue` or `setIssueStatus`:
      they only appear in `src/queries/issues.ts`
- [ ] Creating an issue updates the header counter, and nobody emits or listens
      to a `created` event
- [ ] Closing an issue moves it before the `PATCH` comes back
- [ ] With the failure switch on, the issue comes back and the error shows
- [ ] The Vue Query inspector in the devtools lists `["issues","open"]`,
      `["issues","closed"]` once visited, and shows them go stale and refetch

**You can explain**

- [ ] Why `useQuery(() => issuesQuery(filter.value))` refetches when the filter
      changes, and `useQuery(issuesQuery(filter.value))` does not
- [ ] The difference between `isPending` and `isFetching`, and which one the
      "refreshing…" hint should use
- [ ] What `staleTime` changes, and what `gcTime` changes — a query can be stale
      and still cached
- [ ] Why `onMutate` cancels the in-flight queries before writing to the cache

## Going further

- *(Bonus)* Prefetch on hover: `queryClient.prefetchQuery(issuesQuery('closed'))`
  on the `mouseenter` of the "closed" tab. Check that clicking it afterwards
  sends nothing.
- Install `@tanstack/vue-query-devtools` and mount `<VueQueryDevtools />`: the
  floating panel shows the cache without opening the browser devtools.
- Write the same `useSetIssueStatus` without `onMutate`, reading
  `useMutationState` in the list to show the pending status instead. Which one
  would you choose when three components show the same issue?
- Replace `staleTime: 30_000` with `staleTime: Infinity` and an invalidation on
  every mutation. What would it take to be sure the cache never lies?
