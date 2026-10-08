# Retries

A failed query function is **retried** before the query goes to `error`:

| | Queries | Mutations |
|---|---|---|
| `retry` default | **3** (4 attempts in all) | **0** |
| `retryDelay` default | exponential: **1 s, 2 s, 4 s**… capped at **30 s** | same |
| On the server (SSR) | 0 | 0 |

```text
attempt 1 ✗ ── 1 s ── attempt 2 ✗ ── 2 s ── attempt 3 ✗ ── 4 s ── attempt 4 ✗ ──▶ status: 'error'
          failureCount: 1           failureCount: 2           failureCount: 3
```

- About **7 seconds** of "loading" before the user sees an error — with the
  default settings and a server that fails fast
- During retries `status` does not move; `failureCount` and `failureReason`
  (the last error) do — use them for a *"Still trying… (2/3)"* message
- Retries **pause** while the tab is hidden or the device offline, and resume
  after

<style>
table { font-size: 0.85em; }
</style>

---

# Configuring retries

```ts
queryOptions({
  queryKey: issueKeys.detail(id),
  queryFn: () => fetchIssue(id),

  retry: (failureCount, error) => failureCount < 2,   // failureCount starts at 0
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),   // the default
});
```

| `retry` | | `retryDelay` | |
|---|---|---|---|
| `false` / `0` | never | `500` | constant |
| `1` | one more attempt | `(attempt) => attempt * 1000` | linear |
| `true` | forever — careful | `(attempt, error) => …` | depends on the error |

- Both accept a **function** — the error is passed in: the retry policy can
  depend on **what** failed
- Set the app-wide policy in `defaultOptions.queries`, override per query
- In **tests**: `retry: false`, or every error test waits 7 s (chapter 06)

---

# Retry by status — don't retry a 404

Retrying makes sense for **transient** failures (a 503, a timeout, a network
hiccup). It is pointless — and slow — for a **client** error:

```ts
import { ApiError } from '../api/fakeApi';

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;            // 400, 401, 403, 404: the answer will not change
  }
  return failureCount < 3;   // 5xx and network errors: try again
}

new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } });
```

- `GET /issues/999` → `ApiError(404)` → **error at once**, no 7 s spinner
- `429 Too Many Requests`: retry, with a delay honouring `Retry-After`
- Type the error globally (`Register.defaultError`) so `error` is an `ApiError`
  everywhere instead of `Error`:

```ts
declare module '@tanstack/query-core' {
  interface Register { defaultError: ApiError }
}
```

---

# `retryOnMount` and what stays in error

```ts
queryOptions({ ...issueQuery(id), retryOnMount: false });
```

- A query in `error` **with no data** is retried when a component mounts —
  `retryOnMount: true`, the default
- `false`: the component shows the cached error without trying again; useful
  for an endpoint you know is down, to avoid a retry storm on navigation
- An error is **not** cached forever: the next trigger (mount, focus, reconnect,
  invalidation, `refetch()`) tries again
- `queryClient.resetQueries({ queryKey })` puts the query back to its initial
  state — handy for a *"Try again"* button that should show the skeleton again

<br />

> Workshop 02, bonus: `retry` by status — no retry on a **404** (open a detail
> that does not exist), a retry on the 503 of *"Fail the next request"* — the second attempt succeeds,
> the user never sees the error.
