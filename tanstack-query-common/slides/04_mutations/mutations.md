# Queries read, mutations write

| | Query | Mutation |
|---|---|---|
| Purpose | **read** server state | **change** server state: `POST`, `PATCH`, `DELETE`… |
| Runs | **declaratively** — when a component needs the key | **imperatively** — when you call `mutate()` |
| Identified by | a **key** (required) | nothing — a `mutationKey` is optional |
| Cached | yes, shared by key | no: each call is its own `Mutation` |
| Deduplicated | yes | **no** — two calls, two requests |
| Re-run automatically | on mount, focus, reconnect, invalidation | **never** |
| `retry` default | 3 | **0** — a write is not always safe to repeat |
| States | `pending` / `error` / `success` | **`idle`** / `pending` / `error` / `success` |

<br />

> A mutation does **not** update any query by itself. After a write, **you**
> tell the cache what changed — invalidation, `setQueryData`, or an optimistic
> update. That is the rest of today.

<style>
table { font-size: 0.85em; }
</style>

---

# The options of a mutation

```ts
import type { QueryClient } from '@tanstack/query-core';

// Plain options — identical for useMutation / injectMutation
export const createIssueMutation = (queryClient: QueryClient) => ({
  mutationKey: ['issues', 'create'] as const,
  mutationFn: (input: { title: string }) => createIssue(input),  // (variables, context) => Promise<TData>
  onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
});
```

- `mutationFn` receives the **variables** — what you pass to `mutate()` — and a
  context `{ client, meta, mutationKey }`
- **One** variables argument: pass an object for several values
  (`{ id, patch }`)
- Like `queryFn`: **throw** to signal an error
- The adapter's mutation function (`useMutation` / `injectMutation`) returns the
  **state** and the **trigger**

---

# `mutate` vs `mutateAsync`

<div style="display: flex; gap: 2em;">
<div>

### `mutate(variables, callbacks?)`

```ts
mutate({ title }, {
  onSuccess: (issue) => clearInput(),
  onError: (error) => focusInput(),
});
```

- Returns **nothing**; **never throws** — errors go to `error` and the
  callbacks
- The default choice in event handlers

</div>
<div>

### `mutateAsync(variables, callbacks?)`

```ts
try {
  const issue = await mutateAsync({ title });
  navigateTo(`/issues/${issue.id}`);
} catch (error) {
  // YOU must catch — or an unhandled rejection
}
```

- Returns a **promise** of the data
- For composing: awaiting in a form library's `onSubmit`, running mutations in
  sequence, `Promise.all`

</div>
</div>

<br />

- Both update the same state (`isPending`, `error`, `data`)
- Prefer `mutate` + callbacks; reach for `mutateAsync` when the **caller** needs
  the result as a value

---

# The state of a mutation

| Field | |
|---|---|
| `status` | `'idle'` → `'pending'` → `'success'` \| `'error'` |
| `isIdle`, `isPending`, `isSuccess`, `isError` | the same, as flags |
| `variables` | what was passed to the **last** `mutate()` — available **while pending** (optimistic UI, chapter 05) |
| `data` | the `mutationFn`'s result |
| `error` | the thrown error (`null` otherwise) |
| `failureCount`, `failureReason` | retries in progress |
| `isPaused` | waiting for the network |
| `submittedAt` | timestamp of the call |
| `reset()` | back to `idle` — clear an error message |

<br />

- `isPending` disables the submit button — a double-click would send **two**
  `POST`s: mutations are **not** deduplicated
- The state follows the **last** call: three quick `mutate()` share one state
  object

<style>
table { font-size: 0.85em; }
</style>

---

# `mutationKey`, `scope`, `retry`

```ts
export const deleteIssueMutation = (queryClient: QueryClient) => ({
  mutationKey: ['issues', 'delete'] as const,          // name it: devtools, filters, defaults
  mutationFn: (id: number) => deleteIssue(id),
  scope: { id: 'issues' },                             // mutations of a scope run one after the other
  retry: 2,                                            // only if the operation is idempotent
  onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
});
```

- **`mutationKey`** — not a cache key: a **label**. Used by
  `queryClient.isMutating({ mutationKey })`, the mutation state, the devtools,
  `setMutationDefaults`
- **`scope.id`** — mutations sharing a scope are **serialised**: the second
  waits (`isPaused`) until the first settles. For writes whose order matters
  (rename, then rename again); without a scope, they run in parallel
- **`retry`** — `DELETE` and `PUT` are idempotent and safe to retry; a `POST`
  that creates is **not** (two issues?) unless the server deduplicates with an
  idempotency key
