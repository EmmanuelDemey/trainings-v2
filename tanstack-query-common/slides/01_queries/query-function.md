# The query function — a contract

```ts
queryFn: (context) => Promise<TData>
```

1. **Return the data** — anything but `undefined` (use `null` for "nothing")
2. **Throw** (or return a rejected promise) **to signal an error** — that is the
   *only* way TanStack Query learns about a failure, and the only thing it
   retries

<div style="display: flex; gap: 2em;">
<div>

```ts
// ❌ fetch does NOT reject on a 404 or a 500
queryFn: () => fetch(`/api/issues/${id}`).then((r) => r.json())
// → a 500's error page is cached as "success" data
```

</div>
<div>

```ts
// ✅ turn a bad status into a thrown error
queryFn: async () => {
  const response = await fetch(`/api/issues/${id}`);
  if (!response.ok) throw new ApiError(response.status, response.statusText);
  return (await response.json()) as Issue;
}
```

</div>
</div>

- `fetch` only rejects on a **network** failure. axios, `ky`, Angular's
  `HttpClient` (through `lastValueFrom`) do throw on 4xx/5xx
- Our fake API already rejects with an `ApiError` carrying the HTTP `status`
- Returning `undefined` is an **error** in v5 (logged in development): the
  cache could not tell "no data yet" from "the data is undefined"

---

# The `QueryFunctionContext`

The query function receives one argument:

```ts
type QueryFunctionContext = {
  queryKey: QueryKey;     // the key of THIS query
  signal: AbortSignal;    // aborted when the query is cancelled
  meta: QueryMeta | undefined;
  client: QueryClient;
  pageParam?: unknown;    // infinite queries only (chapter 03)
};
```

```ts
// A query function that reads its parameters from the key — reusable across keys
export const issueQuery = (id: number) =>
  queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: ({ queryKey: [, , issueId] }) => fetchIssue(issueId),
  });
```

- Reading from `queryKey` guarantees the function **only** depends on the key —
  the "everything in the key" rule, enforced by construction
- A closure (`() => fetchIssue(id)`) is equally valid and more common: just
  keep the key and the closure in sync — `queryOptions` helps

---

# Cancellation with `signal`

```ts
export async function fetchIssuesHttp(filter: IssueFilter, signal?: AbortSignal) {
  const response = await fetch(`/api/issues?status=${filter}`, { signal });
  if (!response.ok) throw new ApiError(response.status, response.statusText);
  return (await response.json()) as IssueSummary[];
}

queryOptions({
  queryKey: issueKeys.list(filter),
  queryFn: ({ signal }) => fetchIssuesHttp(filter, signal),
});
```

The query is **cancelled** — and the signal aborted — when:

- every component using it **unmounts** (or its key changes) **while** the
  request is in flight — *only if* the query function **consumed** the `signal`
- `queryClient.cancelQueries({ queryKey })` is called — e.g. before an
  optimistic update (chapter 05)
- a newer fetch replaces it (`refetch()` with `cancelRefetch: true`, the default)

<br />

> If you never read `signal`, TanStack Query does **not** cancel: the request
> finishes and its result is **cached** anyway — often what you want for small
> GETs. Pass it on for large downloads, search-as-you-type, slow endpoints.

---

# Deduplication

```ts
// Two callers ask at the same time, same key
queryClient.query(issuesQuery('open'));   // starts GET /issues?status=open
queryClient.query(issuesQuery('open'));   // reuses the promise in flight
```

```text
t=0    counter subscribes  ['issues','list','open']  → Query created, fetch starts
t=5    list subscribes     ['issues','list','open']  → Query exists, fetch in flight → join it
t=400  response            → one cache write → both components render the same data
```

- **One `Query` per key hash**, and a query has **at most one fetch** in flight:
  every observer awaits the same promise
- This is why the **duplicate red line** of workshop 01 disappears as soon as
  both components use the same key
- It is per **key**, not per URL: two different keys calling the same URL are
  two requests — another reason to centralise keys
- `queryClient.query(options)` is the **imperative** read: cached data if fresh,
  otherwise a fetch. It replaces `fetchQuery`, deprecated in recent 5.x
  releases — you will still meet `fetchQuery` in most codebases

---

# Where the function lives

```ts
// ❌ API call written inline, everywhere
{ queryKey: ['issues', 'list', filter],
  queryFn: () => fetch(`/api/issues?status=${filter}`).then((r) => r.json()) }

// ✅ an API module (plain functions, no TanStack Query) + a queries module
// src/api/issues.ts        → fetchIssues(filter, signal?): Promise<IssueSummary[]>
// src/issues/queries.ts    → issueKeys, issuesQuery(filter), issueQuery(id)
```

- The **API module** knows HTTP: URLs, headers, errors, parsing (and validation,
  e.g. with Zod)
- The **queries module** knows the cache: keys, `staleTime`, `select`, retries
- Components know **neither**: they call the adapter's query function with
  `issuesQuery(filter)`
- Each layer is testable alone — and replaceable (the workshops swap the real
  HTTP for the fake server without touching a query)
