---
layout: cover
---

# 17 - Server state with TanStack Query

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** server state from client state, and explain why a store is the wrong
  home for the first one
- **Read** data with `useQuery`, a **key factory** and `queryOptions`, and make a
  key follow a `ref` with a getter
- **Tune** a query's lifecycle with `staleTime` and `gcTime` — and tell a stale
  query from an evicted one
- **Write** data with `useMutation`, and keep every screen honest with
  `invalidateQueries`
- **Build** an optimistic update that rolls back, and **test** components that
  query

---

# Server state is not client state

<div style="display: flex; gap: 2em;">
<div>

### Client state

- **Owned** by the app: a theme, a draft, an open panel
- Always **up to date** — you are the only writer
- Synchronous
- ➜ a `ref`, a composable, Pinia

</div>
<div>

### Server state

- **Borrowed**: the server owns it, you hold a **copy**
- Goes **stale** the moment it arrives — someone else can change it
- Asynchronous: loading, error, retry, cancellation
- Needed by **several components**, at different times

</div>
</div>

<br />

- Chapter 9 ended on an async action carrying its own `status`, `error` and
  `AbortController`. Now add **caching**, **deduplication**, **refetch on
  focus**, **invalidation after a write**… for every endpoint
- That is a library's job. **TanStack Query** (`@tanstack/vue-query`) is the one
  shared with React, Solid, Svelte and Angular

---

# Setup

```bash
npm install @tanstack/vue-query
```

```ts
// src/queryClient.ts
import { QueryClient } from '@tanstack/vue-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });
}
```

```ts
// src/main.ts
import { VueQueryPlugin } from '@tanstack/vue-query';

createApp(App).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');
```

- The **`QueryClient`** holds the cache — one per app, and **one per test**
- A **factory** rather than a module-level instance: the specs build a fresh
  client with the same defaults as production
- The plugin also registers a **Vue Query** inspector in the Vue Devtools

---

# `useQuery`

```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const { data, isPending, isFetching, error } = useQuery({
  queryKey: ['issues', 'open'],
  queryFn: () => fetchIssues('open'),
});
</script>

<template>
  <p v-if="isPending">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ul v-else>
    <li v-for="issue in data" :key="issue.id">{{ issue.title }}</li>
  </ul>
  <small v-if="isFetching">refreshing…</small>
</template>
```

- Every field is a **ref**: destructuring is safe — unlike a Pinia store
- **`isPending`** — no data yet. **`isFetching`** — a request in flight, even
  behind cached data
- Two components asking for the **same key** at the same time share **one
  request** and **one cache entry**

---

# Query keys

```ts
['issues']                          // every issue list
['issues', 'open']                  // one filter
['issues', 'open', { page: 2 }]     // objects are hashed deterministically
['issue', 42]                       // one issue
```

- A key is an **array**, and it is **hierarchical**: invalidating `['issues']`
  hits every key that **starts with** it
- Everything the `queryFn` depends on **goes in the key** — otherwise two
  different requests share one cache entry

Centralize them in a **key factory**:

```ts
export const issueKeys = {
  all: ['issues'] as const,
  list: (filter: IssueFilter) => [...issueKeys.all, filter] as const,
  detail: (id: number) => [...issueKeys.all, 'detail', id] as const,
};
```

---

# `queryOptions` — key and fetcher, together

```ts
import { queryOptions } from '@tanstack/vue-query';

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}
```

```ts
useQuery(issuesQuery('open'));                                   // a component
useQuery({ ...issuesQuery('open'), select: (all) => all.length }); // + local options
queryClient.prefetchQuery(issuesQuery('closed'));                  // on hover
queryClient.getQueryData(issuesQuery('open').queryKey);            // typed: Issue[] | undefined
```

- No component can pair a key with the **wrong fetcher**
- The key is **tagged** with the data type: `getQueryData` / `setQueryData` are
  typed without a generic
- `select` derives what **this** component needs; the cache keeps the full list

---

# A key that follows a `ref`

```ts
const filter = ref<IssueFilter>('open');

useQuery(issuesQuery(filter.value));          // ❌ read ONCE, at setup
useQuery(() => issuesQuery(filter.value));    // ✅ a getter: re-read on change

useQuery({                                    // ✅ also: a ref inside the key
  queryKey: ['issues', filter],
  queryFn: () => fetchIssues(filter.value),
});
```

- The getter form re-evaluates **all** options when a dependency changes — the
  cleanest way to combine a factory with reactive input
- A new key is a **new cache entry**: the old one stays, ready for when you come
  back
- `placeholderData: keepPreviousData` keeps the previous list on screen while
  the new key loads — no empty flash

```ts
const { data, isPlaceholderData } = useQuery(() => ({
  ...issuesQuery(filter.value),
  placeholderData: keepPreviousData,
}));
```

---

# The lifecycle — `staleTime` vs `gcTime`

```
 fetch ──▶  FRESH  ──── staleTime ────▶  STALE  ──── (no observer) ── gcTime ──▶  GONE
            served from cache,           served from cache AND                 evicted,
            no request                   refetched in the background           next read = loading
```

| Option | Default | Controls |
|---|---|---|
| `staleTime` | **`0`** | how long the data is trusted without asking the server |
| `gcTime` | 5 min | how long an **unused** entry stays in memory |

- `staleTime: 0` means: **every mount refetches**. It is why a default setup
  "does too many requests" — set a `staleTime` that matches your data
- A stale query is **still shown** — the refetch happens behind it
- Stale queries also refetch on **window focus** and **reconnect**

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
}
</style>

---

# `useMutation` and invalidation

```ts
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIssue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}
```

```vue
<script setup lang="ts">
const { mutate, isPending, error } = useCreateIssue();
const submit = () => mutate(title.value, { onSuccess: () => (title.value = '') });
</script>
```

- `invalidateQueries` marks the matching queries **stale**, and refetches the
  ones on screen — **every** component showing them updates, told or not
- **Returning** the promise keeps the mutation `pending` until the refetch is
  back: the button stays disabled until the new data is on screen
- No more `emit('created')` bubbling up to whoever holds the list

---

# Optimistic updates

```ts
return useMutation({
  mutationFn: ({ id, status }) => setIssueStatus(id, status),

  onMutate: async ({ id, status }) => {
    await queryClient.cancelQueries({ queryKey: issueKeys.all });  // 1. no late overwrite
    const snapshot = queryClient.getQueriesData<Issue[]>({ queryKey: issueKeys.all });
    for (const [key, issues] of snapshot) {                          // 2. write the future
      if (issues) queryClient.setQueryData(key, withStatus(issues, id, status));
    }
    return { snapshot };                                             // 3. hand it to onError
  },

  onError: (_error, _variables, onMutateResult) => {                       // 4. roll back
    for (const [key, issues] of onMutateResult?.snapshot ?? []) queryClient.setQueryData(key, issues);
  },

  onSettled: () => {                                                 // 5. the server decides
    void queryClient.invalidateQueries({ queryKey: issueKeys.all });
  },
});
```

- Here `onSettled` does **not** return the promise: the screen is already right,
  and the error should not wait for a refetch to show

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.3;
}
</style>

---

# Testing components that query

```ts
function mountApp() {
  return mount(App, {
    global: { plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]] },
  });
}
```

- **A fresh `QueryClient` per test** — a shared cache makes each test depend on
  the order they run in
- Build it with the **same factory** as production, and override what gets in
  the way of a test: `retry: false`, so an error fails in one attempt rather than
  after three retries
- Assert on the **page** and on the **requests sent** (MSW, or a fake API's log),
  not on the cache — the cache is an implementation detail
- `vi.waitFor` / `findBy…` for anything that waits on a response

---

# The traps, on one slide

- **Everything the `queryFn` reads goes in the key** — or two requests share
  one entry
- **A getter, not a value**: `useQuery(() => opts(filter.value))`
- **`staleTime: 0` is the default** — decide it, per app or per query
- **`isPending` ≠ `isFetching`** — a spinner on `isFetching` flashes on every
  background refetch
- **Copying `data` into a `ref` or a store** forks the cache: the copy stops
  updating. Read `data`, derive with `select` or `computed`
- **`useQuery` needs an injection context** — `setup`, a composable called from
  it, or pass the `queryClient` explicitly
- **Server state in Pinia *and* in the query cache**: pick one owner per piece
  of data

---

# Recap

- **Server state** is a borrowed, stale-by-default copy — hand it to a query
  layer, keep Pinia for client state
- **One `QueryClient`** per app and per test, built by a factory
- A **key** identifies the data and holds everything the fetch depends on; a
  **key factory** and **`queryOptions`** keep keys and fetchers in one place
- A **getter** makes the options — and the key — follow your refs
- **`staleTime`** says how long to trust the data; **`gcTime`** how long to keep
  it once unused
- **`useMutation` + `invalidateQueries`** refreshes every screen that shows the
  data, without events
- An **optimistic update** is four moves: cancel, snapshot and write, roll back,
  invalidate

---

# Quiz — Question 1 / 3

```ts
const filter = ref<IssueFilter>('open');
const { data } = useQuery(issuesQuery(filter.value));
```

**The user switches `filter` to `'closed'`. What happens?**

- **A.** The query refetches with the new key
- **B.** Nothing — the options were read once, at setup, with `'open'`
- **C.** Vue warns that a ref was unwrapped
- **D.** The `'open'` entry is evicted from the cache

<v-click>

> ✅ **B** — `filter.value` is read once, when `setup` runs. Pass a getter,
> `useQuery(() => issuesQuery(filter.value))`, or put the ref itself in the key.

</v-click>

---

# Quiz — Question 2 / 3

**A query has `staleTime: 30_000` and the default `gcTime`. Its component
unmounts, and remounts 45 seconds later. What does the user see?**

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

**Why does an optimistic `onMutate` start with `await queryClient.cancelQueries(…)`?**

- **A.** To stop the mutation from being sent twice
- **B.** Because `setQueryData` throws while a query is fetching
- **C.** So that a refetch already in flight cannot land after the optimistic
  write and put the old data back
- **D.** To free the memory of the snapshot

<v-click>

> ✅ **C** — A response that left the server before the mutation carries the old
> state. If it lands after `setQueryData`, the screen jumps back until the
> `onSettled` invalidation fixes it.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 17 - TanStack Query
