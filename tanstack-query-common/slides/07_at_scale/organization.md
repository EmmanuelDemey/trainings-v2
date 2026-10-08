# Organising queries in a large codebase

```text
src/
├── api/
│   └── http.ts                 the HTTP client: base URL, auth header, ApiError
├── queryClient.ts              createQueryClient(): defaults, caches, global error handling
├── features/
│   ├── issues/
│   │   ├── issues.api.ts       fetchIssues, fetchIssue, createIssue… (no TanStack Query)
│   │   ├── issues.queries.ts   issueKeys, issuesQuery, issueQuery, issuePageQuery
│   │   ├── issues.mutations.ts createIssueMutation, toggleIssueMutation…
│   │   └── components/…        call the adapter with the options above
│   └── activity/
│       ├── activity.api.ts
│       └── activity.queries.ts activityKeys, activityFeedQuery
└── tests/
```

- **Feature folders**: everything about a resource lives together — the key
  factory sits next to the functions that fetch and invalidate it
- **One module per resource** exporting: the **key factory**, the
  **`queryOptions` factories**, the **mutation option factories**
- The API layer knows nothing about the cache; the cache layer knows nothing
  about components

---

# The resource module

```ts
// features/issues/issues.queries.ts
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: number) => [...issueKeys.details(), id] as const,
};

export const issuesQuery = (filter: IssueFilter) =>
  queryOptions({ queryKey: issueKeys.list(filter), queryFn: () => fetchIssues(filter) });

export const issueQuery = (id: number) =>
  queryOptions({ queryKey: issueKeys.detail(id), queryFn: () => fetchIssue(id), staleTime: 60_000 });

// features/issues/issues.mutations.ts
export const createIssueMutation = (queryClient: QueryClient) => ({
  mutationKey: ['issues', 'create'] as const,
  mutationFn: createIssue,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
});
```

- Naming: `xxxKeys`, `xxxQuery(params)`, `xxxMutation(queryClient)` — greppable
- Other features **import** `issueKeys` to invalidate: no copy of a key anywhere

---

# Avoid the wrapping layers

The classic drift: one custom hook / composable / injectable **per endpoint**,
each calling the adapter's query function with options nobody else can see —
`useIssues(filter)`, then `useIssuesWithSelect`, `useIssuesForCounter`,
`useIssuesPrefetch`…

- A thin hook / composable / injectable per query **hides** the options: each
  new need (a `select`, `enabled`, a different `staleTime`) adds a parameter or a
  variant
- And it only works where the adapter works — not in a router loader, a
  prefetch, a test, a `queryClient` call
- **`queryOptions` factories** compose instead: spread and override at the call
  site, reuse anywhere a `QueryClient` is

```ts
// ✅ one factory, every use
issuesQuery('open');                                           // a component
{ ...issuesQuery('open'), select: (issues) => issues.length }  // the counter
queryClient.prefetchQuery(issuesQuery('closed'));               // a loader
```

- Wrap when you add **real logic** (combining two queries, mapping params from
  the route) — not to rename the adapter's function

---

# Typing it end to end

```ts
// The error type and the meta types, once, for the whole app
declare module '@tanstack/query-core' {          // or the adapter's package: it re-exports Register
  interface Register {
    defaultError: ApiError;
    queryMeta: { errorMessage?: string };
    mutationMeta: { invalidates?: QueryKey; successMessage?: string };
  }
}
```

- `error` is an `ApiError` everywhere — `error.status` without a cast
- `meta` is typed in queries, mutations, and the cache callbacks
- **Never** annotate the adapter's generics by hand
  (`<IssueSummary[], ApiError>` on `useQuery` / `injectQuery`): let `queryFn`'s return type flow
  through `queryOptions`
- Validate at the **boundary**: parse the JSON with a schema (Zod, Valibot) in
  the API layer — the cache then only holds data that matches its type
- The `DataTag` on `queryOptions(…).queryKey` types `getQueryData` /
  `setQueryData` — prefer `issuesQuery(f).queryKey` over `issueKeys.list(f)`
  when you read or write the cache
