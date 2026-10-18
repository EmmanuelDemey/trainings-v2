---
layout: cover
---

# 17 - Server state with TanStack Query

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** server state from client state, and explain why `useEffect` + `useState`
  is the wrong home for the first one
- **Provide** a `QueryClient` to the app, and **read** data with `useQuery`, a
  **query-key factory** and `queryOptions`
- **Tune** a query's lifecycle with `staleTime` and `gcTime`, and tell `isPending`
  from `isFetching`
- **Write** data with `useMutation`, and refresh every screen with
  `invalidateQueries`
- **Persist** the cache across reloads, and **test** components that query

---

# Server state is not client state

<div style="display: flex; gap: 2em;">
<div>

### Client state

- **Owned** by the app: a theme, a filter, an open dialog
- Always **up to date** — you are the only writer
- Synchronous
- ➜ `useState`, Context, Zustand (chapter 19)

</div>
<div>

### Server state

- **Borrowed**: the server owns it, you hold a **copy**
- Goes **stale** the moment it arrives
- Asynchronous: loading, error, retry, cancellation
- Needed by **several components**, at different times

</div>
</div>

<br />

- Chapter 9 fetched in a `useEffect`, with `loading`/`error` states and an
  `AbortController`. Now add **caching**, **deduplication**, **refetch on focus**,
  **invalidation after a write**… for every endpoint
- That is a library's job: **TanStack Query** (ex React Query) — v5

---

# Setup

```bash
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

```tsx
// src/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
}
```

```tsx
// src/main.tsx
const queryClient = createQueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
```

- The **`QueryClient`** holds the cache: **one per app** — created **outside** a
  component, or it is recreated on every render — and **one per test**
- A **factory**: the specs build a fresh client with the production defaults

---

# `useQuery`

```tsx
import { useQuery } from '@tanstack/react-query';

function PeopleTable() {
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ['people'],
    queryFn: ({ signal }) => fetchPeople({ signal }),
  });

  if (isPending) return <p>Loading…</p>;
  if (error) return <p role="alert">{error.message}</p>;

  return (
    <>
      {isFetching && <small>Refreshing…</small>}
      <ul>{data.map((person) => <li key={person.id}>{person.name}</li>)}</ul>
    </>
  );
}
```

- **`isPending`** — no data yet. **`isFetching`** — a request in flight, even
  behind cached data
- After the two early returns, TypeScript **narrows** `data` to `Person[]`
- The `queryFn` receives an **`AbortSignal`**: pass it to `fetch`, cancellation is free
- Two components asking for the **same key** share **one request**, **one cache entry**

---

# The `queryFn` must throw

```ts
export async function fetchPeople({ signal }: { signal?: AbortSignal }): Promise<Person[]> {
  const response = await fetch(`${API}/people`, { signal });
  if (!response.ok) {
    throw new Error(`Cannot load people (${response.status})`);
  }
  return response.json() as Promise<Person[]>;
}
```

- `fetch` only rejects on a **network** error: a 404 or a 500 **resolves**
- If the `queryFn` does not throw, TanStack Query caches the error page as **data**
- A thrown error sets `error`, and triggers the **retries**: 3 by default, with
  exponential backoff — `retry: false` in tests
- With `useSuspenseQuery`, `data` is always defined: loading goes to the nearest
  `<Suspense>`, errors to the nearest error boundary (chapters 10 and 13)

---

# Query keys

```ts
['people']                         // every people list
['people', { search: 'sky' }]      // one filter — objects are hashed deterministically
['people', 'detail', '1']          // one person
```

- A key is an **array**, and it is **hierarchical**: invalidating `['people']`
  hits every key that **starts with** it
- Everything the `queryFn` depends on **goes in the key** — otherwise two
  different requests share one cache entry. The ESLint plugin
  `@tanstack/eslint-plugin-query` checks it (`exhaustive-deps`)

Centralize them in a **key factory**:

```ts
export const peopleKeys = {
  all: ['people'] as const,
  list: (search: string) => [...peopleKeys.all, 'list', { search }] as const,
  detail: (id: string) => [...peopleKeys.all, 'detail', id] as const,
};
```

---

# `queryOptions` — key and fetcher, together

```ts
import { queryOptions } from '@tanstack/react-query';

export function personQuery(id: string) {
  return queryOptions({
    queryKey: peopleKeys.detail(id),
    queryFn: ({ signal }) => fetchPerson(id, { signal }),
  });
}
```

```tsx
useQuery(personQuery(id));                                        // a component
useQuery({ ...personQuery(id), select: (person) => person.name });  // + local options
queryClient.prefetchQuery(personQuery(id));                       // on hover, in a loader
queryClient.getQueryData(personQuery(id).queryKey);               // typed: Person | undefined
```

- No component can pair a key with the **wrong fetcher**
- The key is **tagged** with the data type: `getQueryData` / `setQueryData` are
  typed without a generic
- `select` derives what **this** component needs; the cache keeps the full object

---

# Dependent and paginated queries

```tsx
function PersonDetail({ id }: { id: string | undefined }) {
  const { data } = useQuery({
    ...personQuery(id ?? ''),
    enabled: id !== undefined,           // wait until there is an id
  });
  // …
}
```

```tsx
import { keepPreviousData } from '@tanstack/react-query';

const { data, isPlaceholderData } = useQuery({
  queryKey: peopleKeys.list(search),
  queryFn: ({ signal }) => fetchPeople({ search, signal }),
  placeholderData: keepPreviousData,     // keep the old list while the new one loads
});
```

- `enabled: false` — the query waits: no request, `isPending` stays `true`
- A new key is a **new cache entry**, so a new loading state. `keepPreviousData`
  shows the previous result meanwhile, flagged by `isPlaceholderData`
- `useInfiniteQuery` for "load more" lists, `useQueries` for a dynamic number of queries

---

# How long is data good? `staleTime` and `gcTime`

<br />

| | `staleTime` | `gcTime` |
|---|---|---|
| Question | how long do I **trust** the data? | how long do I **keep** unused data? |
| Default | **0** — stale at once | **5 minutes** |
| When it runs out | next mount / focus / reconnect **refetches** | the entry is **deleted** |

<br />

- **Stale** data is still **shown** — and refetched in the background
- An entry with **no component** observing it starts its `gcTime` countdown
- Refetch triggers: `refetchOnMount`, `refetchOnWindowFocus`,
  `refetchOnReconnect` (all on), and an opt-in `refetchInterval`
- `staleTime: 0` explains the "why does it refetch every time I switch tabs?"
  surprise: **choose** a value — per app, per query

---

# `useMutation`

```tsx
function LikeButton({ person }: { person: Person }) {
  const queryClient = useQueryClient();

  const like = useMutation({
    mutationFn: (id: string) => likePerson(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: peopleKeys.all }),
  });

  return (
    <button onClick={() => like.mutate(person.id)} disabled={like.isPending}>
      {like.isPending ? 'Liking…' : `Like ${person.name}`}
    </button>
  );
}
```

- A mutation is **imperative**: nothing runs until `mutate(variables)`
- `isPending`, `isError`, `error`, `data`, `reset()` — the state of the **last call**
- `onSuccess` **returns** the invalidation promise: the mutation stays pending
  until the fresh data has arrived — no flash of the old value

---

# Invalidation

```ts
queryClient.invalidateQueries({ queryKey: peopleKeys.all });             // every people query
queryClient.invalidateQueries({ queryKey: peopleKeys.detail('1') });     // one person
queryClient.invalidateQueries({ queryKey: peopleKeys.all, exact: true }); // only ['people']
```

- Invalidating marks the matching queries **stale**, and refetches those that are
  **on screen**; the others refetch when they are mounted again
- That is the whole trick: the mutation does not know **which screens** show the
  data — the key hierarchy does
- Shortcut when the server returns the updated object:
  `queryClient.setQueryData(personQuery(id).queryKey, updated)`
- Callbacks also receive a **context** with the `client`:
  `onSuccess: (data, variables, onMutateResult, { client }) => …`

---

# Optimistic updates

```tsx
const like = useMutation({
  mutationFn: likePerson,
  onMutate: async (id, { client }) => {
    const { queryKey } = personQuery(id);
    await client.cancelQueries({ queryKey });               // 1. no late response
    const previous = client.getQueryData(queryKey);         // 2. snapshot
    client.setQueryData(queryKey, (p) => p && { ...p, likes: p.likes + 1 }); // 3. write the future
    return { previous };
  },
  onError: (_error, id, onMutateResult, { client }) => {    // 4. roll back
    client.setQueryData(personQuery(id).queryKey, onMutateResult?.previous);
  },
  onSettled: (_data, _error, id, _result, { client }) =>    // 5. the server decides
    client.invalidateQueries({ queryKey: personQuery(id).queryKey }),
});
```

- The simpler alternative: render `like.variables` while `like.isPending` —
  no cache surgery, rolled back for free

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.3;
}
</style>

---

# Persisting the cache

```bash
npm install @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
```

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 } },   // 24 h
});
const persister = createSyncStoragePersister({ storage: window.localStorage });

<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24, buster: APP_VERSION }}
>
  <App />
</PersistQueryClientProvider>
```

- On reload, the cache is **restored** first: the page renders from storage, then refetches
- `gcTime` must be **≥ `maxAge`** — or entries are garbage-collected before being saved
- `buster`: a new value **discards** an old cache whose shape changed
- `createAsyncStoragePersister` for IndexedDB / React Native's AsyncStorage

---

# Testing components that query

```tsx
function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

it('shows the people returned by the API', async () => {
  renderWithClient(<PeopleTable />);

  expect(await screen.findByRole('cell', { name: 'Luke Skywalker' })).toBeInTheDocument();
});
```

- **A fresh `QueryClient` per test** — a shared cache makes each test depend on
  the order they run in
- `retry: false`: an error fails in one attempt, not after three retries
- The network is mocked with **MSW**, not the hooks: override a handler with
  `server.use(...)` to test the error state
- Assert on the **page**, never on the cache — it is an implementation detail

---

# The traps, on one slide

- **Everything the `queryFn` reads goes in the key** — or two requests share one entry
- **The `queryFn` must throw** on `!response.ok` — `fetch` does not
- **`new QueryClient()` inside a component** — a new, empty cache on every render
- **`staleTime: 0` is the default** — decide it
- **A spinner on `isFetching`** flashes on every background refetch — use `isPending`
- **Copying `data` into `useState`** forks the cache: the copy stops updating.
  Read `data`, derive with `select` or during render
- **A query inside `useEffect`**, or `useQuery` for a POST: React Doctor flags
  both (chapter 23)

---

# Recap

- **Server state** is a borrowed, stale-by-default copy — hand it to a query
  layer, keep `useState`/Zustand for client state
- **One `QueryClient`** per app and per test, provided by `QueryClientProvider`
- A **key** identifies the data and holds everything the fetch depends on; a
  **key factory** and **`queryOptions`** keep keys and fetchers in one place
- **`staleTime`** says how long to trust the data; **`gcTime`** how long to keep
  it once unused
- **`useMutation` + `invalidateQueries`** refreshes every screen that shows the
  data, without wiring them together
- **`PersistQueryClientProvider`** restores the cache after a reload
- Tests: a fresh client with `retry: false`, MSW for the network

---

# Quiz — Question 1 / 3

```tsx
function PersonName({ id }: { id: string }) {
  const { data } = useQuery({ queryKey: ['person'], queryFn: () => fetchPerson(id) });
  return <span>{data?.name}</span>;
}
```

**The page renders `<PersonName id="1" />` and `<PersonName id="2" />`. What is shown?**

- **A.** Luke, then Leia — each component has its own query
- **B.** The same name twice — both components share the `['person']` entry
- **C.** An error: two queries cannot have the same key
- **D.** Nothing until both requests are done

<v-click>

> ✅ **B** — The cache is keyed by `queryKey` only. `id` is read by the `queryFn`
> but missing from the key, so both components read one entry. Use
> `['person', id]` — or `personQuery(id)`.

</v-click>

---

# Quiz — Question 2 / 3

**A query has `staleTime: 30_000` and the default `gcTime`. Its component
unmounts, and mounts again 45 seconds later. What does the user see?**

- **A.** A loading state, then the data
- **B.** The cached data at once — and a background refetch, because it is stale
- **C.** The cached data at once, and no request at all
- **D.** An error: the entry was garbage-collected

<v-click>

> ✅ **B** — 45 s is past `staleTime`, so the data is stale, but well under the
> 5 minutes of `gcTime`, so it is still cached. Stale data is shown **and**
> refetched. Under 30 s it would be **C**; after `gcTime`, **A**.

</v-click>

---

# Quiz — Question 3 / 3

**After `createPerson` succeeds, the new person must appear in the list. What is
the idiomatic way?**

- **A.** Push the person into a `useState` copy of the list
- **B.** Call `window.location.reload()`
- **C.** `queryClient.invalidateQueries({ queryKey: peopleKeys.all })` in `onSuccess`
- **D.** Remount the table with a new `key`

<v-click>

> ✅ **C** — Invalidation marks every query under `['people']` stale and refetches
> the ones on screen. The mutation does not need to know which components show
> the list.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 17 - Server state with TanStack Query
