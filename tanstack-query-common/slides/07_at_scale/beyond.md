# Persisting the cache

Reload the page → the cache is empty → every screen starts with a skeleton.
Persist it to storage and restore it at start-up:

```ts
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 24 * 60 * 60_000 } },   // ≥ maxAge, or restored entries are collected
});

persistQueryClient({
  queryClient,
  persister: createAsyncStoragePersister({ storage: window.localStorage }),
  maxAge: 24 * 60 * 60_000,
  buster: APP_VERSION,                                          // a new deploy discards the old cache
  dehydrateOptions: { shouldDehydrateQuery: (query) => query.meta?.persist === true },
});
```

- Restored data is shown **at once**, then refetched if stale — like any cache hit
- Choose **what** to persist: never tokens or personal data in `localStorage`
- Each adapter ships a provider / helper that waits for the restore before
  rendering (`PersistQueryClientProvider`, …)

---

# Offline mutations

```ts
// 1. Defaults BY KEY — a function cannot be persisted, the key can
queryClient.setMutationDefaults(['issues', 'toggle'], {
  mutationFn: ({ id, status }: Toggle) => updateIssue(id, { status }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
});

// 2. The app only names the mutation: { mutationKey: ['issues', 'toggle'] }

// 3. Once the persisted cache is restored, replay what was waiting
await queryClient.resumePausedMutations();
```

- Offline, with `networkMode: 'online'` (default), a mutation is **paused**
  (`isPaused`), not failed; it runs when `onlineManager` says online again
- Persisted with the cache, a paused mutation survives a **reload** — and
  finds its `mutationFn` again through `setMutationDefaults`
- Combine with **optimistic updates** and `scope` (to keep the order of the
  queued writes) for an offline-first experience

---

# Server-side rendering and hydration

```ts
// On the server, PER REQUEST — never a module-level client: users would share a cache
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
await queryClient.prefetchQuery(issuesQuery('open'));
const state = dehydrate(queryClient);                 // a serialisable snapshot
// … render the HTML, embed `state` in the page

// On the client, before rendering
hydrate(queryClient, window.__QUERY_STATE__);         // the cache starts full
```

- The client renders with the server's data: **no loading state**, no second
  request on hydration
- Set a **`staleTime` > 0** on the client — with `0`, every query hydrated from
  the server is refetched **immediately** on mount
- On the server `retry` defaults to `0` and `gcTime` to `Infinity`
- Frameworks wrap it: Next.js / TanStack Start (`HydrationBoundary`), Nuxt
  (`useState` + `dehydrate` in a plugin), Angular SSR (the dehydrated state
  carried by `TransferState`) —
  the training links its own

---

# Real-time: the server pushes, the cache follows

```ts
const events = new EventSource('/api/events');          // or a WebSocket

events.addEventListener('issue-updated', (event) => {
  const issue = JSON.parse(event.data) as Issue;
  // The payload IS the new data: write it
  queryClient.setQueryData(issueKeys.detail(issue.id), issue);
  // Lists are affected: mark them stale, refetch the visible ones
  void queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
});

events.addEventListener('issue-deleted', (event) => {
  const { id } = JSON.parse(event.data) as { id: number };
  queryClient.removeQueries({ queryKey: issueKeys.detail(id), exact: true });
  void queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
});
```

- The push channel only says **what changed**; the cache stays the single
  source for the UI — the same rules as after a mutation
- With pushes, raise `staleTime` (even `Infinity`): the server tells you when
  data changes, no need to poll or refetch on focus
- Reconnecting? Invalidate everything the socket covers: events were missed

---

# Several tabs, one cache

```ts
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';

broadcastQueryClient({ queryClient, broadcastChannel: 'issue-tracker' });
```

- Uses the **`BroadcastChannel`** API: a query updated in one tab (fetched,
  `setQueryData`, removed) is mirrored in the others
- Close an issue in tab A → tab B updates without refetching
- **Experimental** package — fine for internal tools; for critical sync prefer
  server pushes or `refetchOnWindowFocus`

<br />

| Need | Tool |
|---|---|
| Survive a reload | persister |
| Writes while offline | paused mutations + `setMutationDefaults` + `resumePausedMutations` |
| First paint with data | SSR + `dehydrate` / `hydrate` |
| Others' changes, live | SSE / WebSocket → `setQueryData` / `invalidateQueries` |
| Others' changes, cheap | `refetchOnWindowFocus`, `refetchInterval` |
| Same user, several tabs | `broadcastQueryClient` |

<style>
table { font-size: 0.85em; }
</style>
