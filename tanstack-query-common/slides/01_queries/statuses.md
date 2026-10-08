# Two state machines, not one

A query's result carries **two independent** statuses:

<div style="display: flex; gap: 2em;">
<div>

### `status` — *do I have data?*

| | |
|---|---|
| `'pending'` | no data yet (and no error) |
| `'error'` | the last fetch failed **and** there is an `error` |
| `'success'` | there is `data` |

</div>
<div>

### `fetchStatus` — *is the query function running?*

| | |
|---|---|
| `'fetching'` | the query function is running |
| `'paused'` | it wants to run, but the device is **offline** |
| `'idle'` | it is not running |

</div>
</div>

<br />

- `status` is about the **data**, `fetchStatus` about the **request**
- They combine freely: a query can be `success` **and** `fetching` — the data
  is on screen while a background refetch runs
- That combination is the whole point of a cache: **never hide data you have**

---

# The combinations

| `status` ↓ / `fetchStatus` → | `fetching` | `paused` | `idle` |
|---|---|---|---|
| **`pending`** | First load in progress — *show a skeleton* | First load, waiting for the network | Not started: **disabled** query (`enabled: false`, `skipToken`) |
| **`error`** | Refetching after a failed **refetch** (data kept) | Same, offline | Failed, nothing running |
| **`success`** | **Background refetch** — data on screen | Stale refetch waiting for the network | Data on screen, nothing running |

<br />

- A **disabled** query with no data is `pending` + `idle` — it is "pending"
  forever, which is why `isPending` alone is not "loading"
- An `error` with previous data keeps the **data**: `data` and `error` can both
  be set (`isRefetchError`)
- During retries, `status` does not change and `failureCount` / `failureReason`
  grow — `error` is only set after the **last** attempt
- A new fetch of a query that failed **without data** goes back to `pending`

<style>
table { font-size: 0.85em; }
</style>

---

# The derived flags

| Flag | Means | Equals |
|---|---|---|
| `isPending` | no data yet | `status === 'pending'` |
| `isSuccess` | data is there | `status === 'success'` |
| `isError` | the query failed | `status === 'error'` |
| `isFetching` | the query function is running — **any** time | `fetchStatus === 'fetching'` |
| `isPaused` | it wants to run but is offline | `fetchStatus === 'paused'` |
| `isLoading` | **first** load in progress | `isPending && isFetching` |
| `isRefetching` | **background** refetch | `isFetching && !isPending` |
| `isLoadingError` | the **first** load failed | `isError` with no data |
| `isRefetchError` | a **refetch** failed — previous data kept | `isError` with data |
| `isPlaceholderData` | `data` is a placeholder, not cache content | — |
| `isStale` | the data is past its `staleTime` | — |

<br />

> In TypeScript, the result is a **discriminated union** on `status`: after
> checking `isSuccess` (or `status === 'success'`), `data` is typed **without**
> `undefined`.

<style>
table { font-size: 0.8em; }
</style>

---

# Fetching vs loading — a timeline

```text
            first visit              filter "closed"        back to "open"            window focus
            ─────────────            ───────────────        ──────────────            ────────────
status       pending ──▶ success      pending ──▶ success    success (from cache)      success
fetchStatus  fetching ──▶ idle        fetching ──▶ idle      fetching ──▶ idle         fetching ──▶ idle
isPending    true ──▶ false           true ──▶ false         false                     false
isFetching   true ──▶ false           true ──▶ false         true ──▶ false            true ──▶ false
isLoading    true ──▶ false           true ──▶ false         false                     false
isRefetching false                    false                  true ──▶ false            true ──▶ false
on screen    skeleton ▶ list          skeleton ▶ list        cached list at once,      list stays,
                                                             refreshed silently         refreshed silently
```

- **Loading** = no data **and** fetching: the user has **nothing** to look at
- **Fetching** = a request is in flight — maybe behind data already shown
- Coming back to a key already in the cache is **not** loading: the cached data
  shows at once, the stale one is refreshed **behind** it

---

# Which flag for which UI

<div style="display: flex; gap: 2em;">
<div>

### The big spinner / skeleton

- `isPending` — *nothing to show yet*
- (`isLoading` if the query can be **disabled**: a disabled query is pending
  but not loading)
- Workshop 01: `list-loading` ⇐ `isPending`

### The error message

- `isError` → `error.message`
- With data still there (`isRefetchError`): keep the data, show a **discreet**
  banner

</div>
<div>

### The discreet refresh hint

- `isFetching && !isPending` (= `isRefetching`) — a small "refreshing…", a
  dimmed list, a progress bar
- Workshop 01: `list-refreshing` ⇐ `isFetching` **behind** data

### The anti-pattern

```ts
// ❌ a full-page spinner on isFetching
if (isFetching) return 'Loading…';
```

- Every focus, every remount, every invalidation **blanks the page** — the cache
  is there and you hide it

</div>
</div>

<br />

> Global "something is loading" indicator: `queryClient.isFetching()` — the
> number of queries fetching right now (`useIsFetching` / `injectIsFetching` in
> the adapters).

---

# Renamed in v5 — reading v4 code

| v4 | v5 | Note |
|---|---|---|
| `status: 'loading'` | `status: 'pending'` | "no data yet" |
| `isLoading` | `isPending` | the **status** flag |
| `isInitialLoading` | `isLoading` | v5's `isLoading` = `isPending && isFetching`; `isInitialLoading` is deprecated |
| `cacheTime` | `gcTime` | chapter 02 |
| `keepPreviousData: true` | `placeholderData: keepPreviousData` | chapter 03 |
| `useErrorBoundary` | `throwOnError` | chapter 07 |
| `onSuccess` / `onError` / `onSettled` **on queries** | removed | use the `QueryCache` callbacks or the data itself |
| overloads `useQuery(key, fn, options)` | **one object** `{ queryKey, queryFn, … }` | same for every `queryClient` method |

<br />

- The mutation status was already `idle / loading / success / error` in v4 —
  in v5 it is `idle / pending / success / error`, and `isLoading` became
  `isPending` there too
- Migration codemod: `npx jscodeshift … @tanstack/query-codemods` (see the v5
  migration guide)

<style>
table { font-size: 0.8em; }
</style>
