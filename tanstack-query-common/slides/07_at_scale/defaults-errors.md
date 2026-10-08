# Global defaults — one place for the policies

```ts
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,               // decided, not inherited
        retry: shouldRetry,              // no retry on 4xx
        refetchOnWindowFocus: true,
        throwOnError: (error, query) => query.state.data === undefined && error.status >= 500,
      },
      mutations: {
        retry: 0,
        throwOnError: false,
      },
    },
    queryCache: new QueryCache({ onError: reportQueryError }),
    mutationCache: new MutationCache({ onError: reportMutationError }),
  });
}
```

- **A factory**, not a singleton: the app, every test and every SSR request
  build their own client with the **same** policies
- Review `staleTime` and `retry` like any other architectural decision — the
  defaults (`0` and `3`) are rarely what an app wants

---

# Where errors go

| Error | Best place to show it | How |
|---|---|---|
| A query's **first load** fails | in place of the content | `isError` / `error` in the component |
| A **background refetch** fails (data on screen) | a discreet toast — keep the data | `QueryCache.onError` when `query.state.data !== undefined` |
| A whole **page** can't render without its data | an error **boundary** / error page | `throwOnError` |
| A **mutation** fails, the screen handles it | next to the form | the mutation's `error`, mutate-level `onError` |
| A mutation fails, **nobody** handles it | a global toast | `MutationCache.onError` |
| 401 anywhere | redirect to login | `QueryCache` / `MutationCache` `onError` checking `error.status` |

<br />

- Cache-level callbacks run **once per query** — not once per component, unlike
  a callback in each observer. That is why v5 removed `onError` from queries
- Don't toast **and** show inline: pick by the presence of data or by `meta`

<style>
table { font-size: 0.8em; }
</style>

---

# `throwOnError` and error boundaries

```ts
queryOptions({
  ...issueQuery(id),
  // true: every error · a function: decide per error (error is an ApiError via Register)
  throwOnError: (error, query) => error.status >= 500,
});
```

- With `throwOnError`, the adapter **throws** the error during rendering instead
  of returning it in `error` → the framework's **error boundary** mechanism
  catches it (React's error boundaries, Vue's `onErrorCaptured`, Angular's
  `ErrorHandler`)
- One "Something went wrong — Retry" screen for a whole route, instead of an
  `if (isError)` in every component
- The boundary's *Retry* must also **reset** the query — otherwise it re-throws
  the cached error at once (`QueryErrorResetBoundary` in React,
  `queryClient.resetQueries` in general)
- Renamed in v5: **`useErrorBoundary` → `throwOnError`**
- With **Suspense** (React, Vue), errors are thrown to the boundary by
  default — the same idea, for loading states

---

# `meta` — data for the global handlers

```ts
export const issueQuery = (id: number) =>
  queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: () => fetchIssue(id),
    meta: { errorMessage: `Could not load issue #${id}` },
  });

new QueryCache({
  onError: (error, query) => {
    if (query.state.data !== undefined) {
      toast.error(query.meta?.errorMessage ?? error.message);
    }
  },
});

new MutationCache({
  onSuccess: (_data, _variables, _onMutateResult, mutation) => {
    if (mutation.meta?.successMessage) toast.success(mutation.meta.successMessage);
  },
});
```

- `meta` is **free-form**, stored on the query / mutation, readable in the
  query function (`context.meta`) and every cache callback
- Typed through `Register` (`queryMeta`, `mutationMeta`) — see organisation
- Declarative: the query **says** what it wants, one handler **does** it
