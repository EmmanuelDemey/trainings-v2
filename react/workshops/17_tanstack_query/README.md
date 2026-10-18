# TP 17 — Server state with TanStack Query

> This TP is **autonomous**: it does not depend on any other TP. The fake API,
> the `fetch` functions and a working app built on a hand-written `useFetch` are
> provided; your job is to move its server state to TanStack Query — a cache,
> query keys, a mutation that invalidates, and polling.

## Goal

Chapter 17 — Replace hand-written data fetching with a server-state library:

- **`QueryClient` + `QueryClientProvider`**, with a `staleTime` that means something,
  and the **Devtools**
- **Query keys** built by a factory, and **`queryOptions`** to keep key and function together
- **`useQuery`** for the list and the detail: `isPending`, `isError`, `data` — and the cache
  that comes with it
- **`useMutation`** to like a person, and **`invalidateQueries`** so that every screen
  showing that person refreshes
- **Polling** with `refetchInterval`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the API is mocked by MSW in the browser
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are already written:

| Spec | Grades |
|---|---|
| `src/queries/people.spec.ts` | step 2 — the key factory and the query options |
| `src/components/PeopleList.spec.tsx` | step 3 — the list: loading, data, error |
| `src/components/PersonDetail.spec.tsx` | steps 3 and 4 — the detail, and the like mutation |
| `src/App.spec.tsx` | steps 3, 4 and 5 — the cache, the invalidation, the polling |

The loading/data/error tests of `PeopleList` and `PersonDetail` are **green from the
start**: `useFetch` already does that much. They are your safety net — they must still
be green once `useFetch` is gone. The others are red until you are done.

Every spec renders through `renderWithClient` (`src/tests/render.tsx`): a **fresh**
`QueryClient` per test, built by your own `createQueryClient()`, with the retries
turned off. Read it once — it is the pattern you will reuse in your own projects.

**Already done for you:**

- `src/mocks/` — the fake backend: `GET /api/people`, `GET /api/people/:id`,
  `POST /api/people/:id/like`. It logs every request it receives (`requestsTo()`, used
  by the specs), and `likeFromAnotherTab(id)` lets a spec change the server behind the
  app's back.
- `src/api/people.ts` — `fetchPeople`, `fetchPerson`, `likePerson`: plain `fetch`, which
  **throws** when the response is not OK. TanStack Query needs a rejected promise to
  know a query failed.
- `src/hooks/useFetch.ts` and the two components that use it — the app as it was
  before this chapter.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Create the client, provide it, add the Devtools | `src/queryClient.ts`, `src/main.tsx` | The Devtools flower shows up in the browser |
| 2 | The query-key factory and the query options | `src/queries/people.ts` | `people.spec.ts` is green |
| 3 | `useQuery` instead of `useFetch` | `src/queries/people.ts`, `src/components/*` | Coming back to a person shows them at once, with no request |
| 4 | Like with `useMutation`, then invalidate | `src/queries/people.ts`, `src/components/PersonDetail.tsx` | A like updates the detail **and** the list |
| 5 | Poll the list | `src/queries/people.ts` | The list picks up a like made elsewhere within 10 s |

## Steps

### 1. The client — `src/queryClient.ts`, `src/main.tsx`

1. In `createQueryClient`, set `defaultOptions.queries.staleTime` to `30_000`. The
   default is `0`: the data is stale as soon as it arrives, and every new mount refetches it.
2. In `main.tsx`, create **one** client, outside any component, and wrap `<App />` in
   `<QueryClientProvider client={queryClient}>`. Why would `createQueryClient()` inside
   `App` be a bug?
3. Add `<ReactQueryDevtools initialIsOpen={false} />` inside the provider (it is
   already installed, and left out of the production build).

→ **Done when** the app still works in the browser, with the TanStack flower in the
bottom corner.

### 2. Query keys — `src/queries/people.ts`

1. Write the factory: `peopleKeys.lists()` is `['people', 'list']`, `details()` is
   `['people', 'detail']`, `detail(id)` is `['people', 'detail', id]`. Each level
   **starts with the one above it** — remember this for step 4.
2. Use the factory in `peopleQuery()` and `personQuery(id)`. `queryOptions` keeps a key
   and its function together, typed: `queryClient.getQueryData(personQuery('1').queryKey)`
   is a `Person | undefined` without any type argument.

→ **Done when** `src/queries/people.spec.ts` is green.

### 3. `useQuery` — `src/queries/people.ts`, `src/components/`

1. Export `usePeople()` and `usePerson(id)`: `useQuery(peopleQuery())`,
   `useQuery(personQuery(id))`.
2. In `PeopleList`, replace `useFetch` with `usePeople()`. Use `isPending` (no data
   yet) and `isError`. After the two `if`s, TypeScript knows `data` is defined.
3. The same in `PersonDetail` with `usePerson(id)`.
4. Delete `src/hooks/useFetch.ts`.

In the browser, click Luke, then C-3PO, then Luke again: Luke is back **at once**.
Open the Devtools: one key per person, and the network tab shows no new request
within 30 s. Is it `isPending` or `isFetching` that you would use for a small
"refreshing" spinner — and why not for the "Loading…" message?

→ **Done when** `PeopleList.spec.tsx`, the step 3 tests of `PersonDetail.spec.tsx`,
and "shows a person seen a moment ago at once" in `App.spec.tsx` are green.

### 4. A mutation — `src/queries/people.ts`, `src/components/PersonDetail.tsx`

Click "Like" on the starter: the server counts it (reload to check), the screen does not.

1. Export `useLikePerson()`: `useMutation({ mutationFn: likePerson, onSuccess })`, where
   `onSuccess` **returns** `client.invalidateQueries({ queryKey: peopleKeys.all })`. The
   client is in the callback's last argument, the mutation context:
   `onSuccess: (person, id, onMutateResult, { client }) => …` (`useQueryClient()` works
   too, but costs a hook call).
2. In `PersonDetail`, call `like.mutate(person.id)`. Disable the button and label it
   `Liking…` while `like.isPending`; show `The like was not saved, try again.` in a
   `role="alert"` when `like.isError`.

Why `peopleKeys.all` and not `peopleKeys.detail(id)`? Look at the list. And why
*return* the invalidation's promise from `onSuccess`?

→ **Done when** the step 4 tests are green: a like changes the count in the detail
**and** in the list.

### 5. Polling — `src/queries/people.ts`

1. Add `refetchInterval: 10_000` to `peopleQuery()`.

Open the app in two tabs. Like Vader in the first: the second shows it within 10 s.
Switch away from the second tab for a while, and watch the network tab when you come
back — what does `refetchIntervalInBackground` change, and what does
`refetchOnWindowFocus` already do for you?

→ **Done when** `npm test` is entirely green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the keys, the list, the detail, the like, the cache, the polling
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing, and `src/hooks/useFetch.ts` is gone
- [ ] The Devtools show one `['people', 'list']` key and one `['people', 'detail', id]`
      key per person opened

**The behaviour is there**

- [ ] A person opened less than 30 s ago is shown at once, with no request
- [ ] A like updates the count in the detail and in the list; the button is disabled
      meanwhile
- [ ] A server error shows a message, not a blank page
- [ ] The list picks up a change made in another tab within 10 s, without blinking

**You can explain**

- [ ] The difference between `staleTime` and `gcTime`
- [ ] The difference between `isPending` and `isFetching`
- [ ] Why the keys are hierarchical, and what `invalidateQueries({ queryKey: ['people'] })`
      reaches
- [ ] Why every test gets its own `QueryClient`, and why its retries are off

## Going further

- **Persist the cache** across reloads: `PersistQueryClientProvider` from
  `@tanstack/react-query-persist-client` with `createSyncStoragePersister({ storage:
  window.localStorage })`. Reload: the list is there before the network answers. What
  must `gcTime` be, at least, for this to work?
- **Optimistic like**: update the detail in `onMutate(id, { client })` with `setQueryData`
  and return the previous person; roll back in `onError` from its `onMutateResult`
  argument; invalidate in `onSettled`. Make the server fail one like in three to see
  the rollback.
- **Create a person**: a `useCreatePerson()` mutation (add a `POST /api/people` handler),
  then `setQueryData` on the new person's detail key so that opening it needs no request.
- **Prefetch on hover**: `queryClient.prefetchQuery(personQuery(id))` in the list's
  `onMouseEnter` — the detail is often in the cache before the click.
