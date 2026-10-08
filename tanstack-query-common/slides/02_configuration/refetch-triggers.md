# When does a query refetch?

| Trigger | Option | Default |
|---|---|---|
| A component **subscribes** (mount, new key) | `refetchOnMount` | `true` |
| The tab becomes **visible** again | `refetchOnWindowFocus` | `true` |
| The browser goes back **online** | `refetchOnReconnect` | `true` |
| A **timer** | `refetchInterval` (+ `refetchIntervalInBackground`) | `false` |
| You **invalidate** it | `queryClient.invalidateQueries(…)` | — |
| You **ask** | `refetch()`, `queryClient.refetchQueries(…)` | — |

<br />

- The first three only refetch **stale** queries: with a `staleTime` of 30 s,
  focusing the tab 10 s after a fetch sends **nothing**
- Each takes `true` (if stale), `false` (never), **`'always'`** (even if fresh),
  or a function `(query) => boolean | 'always'`
- Only **active** queries are concerned — an inactive entry is refetched when a
  component uses it again

---

# `true` vs `'always'` — the counter of workshop 02

```ts
export const openCountQuery = queryOptions({
  ...issuesQuery('open'),
  refetchOnWindowFocus: 'always',   // refetch on focus even when fresh
});
```

<div style="display: flex; gap: 2em;">
<div>

### With `staleTime: 30_000` and `true`

1. Fetch at `t = 0`: *28 open*
2. *Another user closes an issue*
3. Switch tab, come back at `t = 10 s`
4. Fresh → **no refetch** → still *28 open* ❌

</div>
<div>

### With `'always'`

1. Fetch at `t = 0`: *28 open*
2. *Another user closes an issue*
3. Switch tab, come back at `t = 10 s`
4. Refetch regardless → *27 open* ✅

</div>
</div>

<br />

- `'always'` overrides freshness **for that trigger only** — keep a sensible
  `staleTime` for mounts
- `staleTime: 'static'` beats everything: a static query is never refetched by
  a trigger, `'always'` included

---

# Window focus, precisely

```ts
import { focusManager } from '@tanstack/query-core';

// The default: listen to `visibilitychange` on window
// → switching tabs or restoring a minimised window counts; clicking into
//   DevTools and back does not

// Custom source — e.g. a mobile app's AppState, an Electron window event
focusManager.setEventListener((setFocused) => {
  const onChange = (visible: boolean) => setFocused(visible);
  const unsubscribe = myPlatform.onVisibilityChange(onChange);
  return unsubscribe;
});

// Tests and demos: force the state
focusManager.setFocused(true);
focusManager.setFocused(undefined);   // back to the real detection
```

- v4 also listened to `focus`, which refetched far too often (every alert, every
  devtools click). v5 listens to **`visibilitychange` only**
- In development, refocusing the tab is a quick way to **see** stale queries
  refetch — or to be surprised by requests you did not expect

---

# Network: `onlineManager` and `networkMode`

```ts
import { onlineManager } from '@tanstack/query-core';

onlineManager.isOnline();            // the current belief
onlineManager.setOnline(false);      // tests, demos, a custom detection
```

| `networkMode` | Offline behaviour | For |
|---|---|---|
| `'online'` (default) | does **not** fetch: `fetchStatus: 'paused'`, resumes on reconnect | a normal HTTP backend |
| `'always'` | fetches anyway, ignores online state; no reconnect refetch | local data: IndexedDB, a worker, a fake API |
| `'offlineFirst'` | tries **once** (the service worker / HTTP cache may answer), then pauses retries | PWAs with a cache layer |

- A paused query is not an error: `status` stays what it was, `fetchStatus` is
  `'paused'` — show "offline", not a failure
- Mutations have the same `networkMode` — paused mutations resume when back
  online (chapter 07)

<style>
table { font-size: 0.85em; }
</style>

---

# Polling with `refetchInterval`

```ts
queryOptions({
  queryKey: ['activity', 'latest'],
  queryFn: () => fetchActivity(0),
  refetchInterval: 10_000,                 // every 10 s while used
  refetchIntervalInBackground: false,      // default: pause when the tab is hidden
});

// Adaptive: poll fast while a job runs, stop when it is done
queryOptions({
  queryKey: ['export', exportId],
  queryFn: () => fetchExport(exportId),
  refetchInterval: (query) => (query.state.data?.status === 'done' ? false : 2_000),
});
```

- Polling refetches **regardless** of `staleTime`
- Only while the query has **observers** — no component, no polling
- Polling is the simple answer to "keep up with others"; websockets / SSE that
  update the cache are the advanced one (chapter 07)
