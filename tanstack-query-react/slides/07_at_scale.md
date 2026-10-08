---
layout: cover
---

# 07 - TanStack Query in a large application

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Organise** queries in feature modules a React codebase can grow with
- **Send** errors to the right place: inline, an error boundary, a global toast
- **Use** Suspense with `useSuspenseQuery`, error boundaries and
  `QueryErrorResetBoundary`
- **Prefetch at scale** in React Router loaders with `ensureQueryData`
- **Know** what React 19 changes — and what it does not — for TanStack Query

---
src: ../../tanstack-query-common/slides/07_at_scale/organization.md
---

---

# A feature module, in React

```text
src/features/issues/
  api.ts              fetchIssues, createIssue…          — no React
  queries.ts          issueKeys, issuesQuery(), issueQuery()  — no React
  mutations.ts        useCreateIssue(), useSetIssueStatus()  — hooks: they need useQueryClient
  components/         IssueList.tsx, IssueDetail.tsx    — call queries.ts and mutations.ts
  index.ts            the public API of the feature
```

- `queries.ts` stays **React-free**: loaders, tests and other features import
  `issueQuery(id)` without rendering anything
- Only what needs a hook becomes a hook. A `useIssues()` that only wraps
  `useQuery(issuesQuery())` adds a name, and hides the options from
  `prefetchQuery` and `getQueryData`
- Another feature needs the issues? It imports `issuesQuery` from
  `features/issues` — the key factory guarantees it shares the cache entry

---
src: ../../tanstack-query-common/slides/07_at_scale/defaults-errors.md
---

---

# Error boundaries, in React

```tsx
// Only server errors go to the boundary; a 404 is handled inline by the component
useQuery({ ...issueQuery(id), throwOnError: (error) => error instanceof ApiError && error.status >= 500 });
```

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

<QueryErrorResetBoundary>
  {({ reset }) => (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div role="alert">
          {error.message} <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <IssuePage />
    </ErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

- Without `reset`, "Try again" re-renders the page… and the query, still in
  error, throws again at once. `reset` tells the queries below to **refetch** on
  the next mount
- `useQueryErrorResetBoundary()` gives the same `reset` to a component

---
src: ../../tanstack-query-common/slides/07_at_scale/prefetching.md
---

---

# React Router loaders + the cache

```tsx
import { createBrowserRouter, useParams, type LoaderFunctionArgs } from 'react-router';

// The loader starts the fetch BEFORE the route renders — no waterfall
const issueLoader = (queryClient: QueryClient) => async ({ params }: LoaderFunctionArgs) => {
  await queryClient.ensureQueryData(issueQuery(Number(params.id)));   // cached? instant
  return null;
};

export const router = createBrowserRouter([
  { path: '/issues/:id', loader: issueLoader(queryClient), Component: IssuePage },
]);

function IssuePage() {
  const id = Number(useParams().id);
  // Same options: the data is in the cache — and the component stays subscribed to it
  const { data: issue } = useSuspenseQuery(issueQuery(id));
  return <h1>{issue.title}</h1>;
}
```

- The **loader** decides what to fetch; the **component** subscribes with the same
  options: refetch on focus, invalidation, optimistic updates keep working
- Never `useLoaderData()` for server state: it is a snapshot that nothing
  invalidates
- 5.104 deprecates `ensureQueryData` in favour of
  `queryClient.query({ ...issueQuery(id), staleTime: 'static' })` — same behaviour

---

# Suspense — `useSuspenseQuery`

```tsx
function IssuePage({ id }: { id: number }) {
  const { data: issue } = useSuspenseQuery(issueQuery(id));   // Issue — never undefined
  const { data: activity } = useSuspenseQuery(activityQuery(id));
  return <IssueView issue={issue} activity={activity} />;
}

<Suspense fallback={<PageSkeleton />}>
  <IssuePage id={7} />
</Suspense>
```

- No `isPending`, no `enabled`, no `placeholderData`: the component only renders
  **with** data; errors go to the nearest error boundary
- ⚠️ Two `useSuspenseQuery` in one component run **one after the other** (the
  first suspends before the second is called): `useSuspenseQueries`, or start
  both in the loader / with `usePrefetchQuery` in the parent
- Changing the key suspends **again** and shows the fallback: wrap the change in
  `startTransition` (or `useTransition`) to keep the old screen while the new one
  loads
- `useSuspenseInfiniteQuery` for infinite queries

---
src: ../../tanstack-query-common/slides/07_at_scale/beyond.md
---

---

# React specifics: SSR, React 19

```tsx
// Next.js App Router — a server component prefetches, the client hydrates the cache
export default async function IssuesPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(issuesQuery('open'));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IssueList />   {/* a client component: useQuery finds the data, no loading state */}
    </HydrationBoundary>
  );
}
```

- **React 19 `use(promise)`**: TanStack Query 5.104 exposes no promise on the
  query result, and no `experimental_prefetchInRender` option — suspend with
  `useSuspenseQuery`, which works the same in React 18 and 19
- **Actions, `useActionState`, `useOptimistic`**: fine for a form's local state;
  as soon as other components show the data, the mutation and the cache are still
  the single source — `useOptimistic` does not update the counter in the header
- **React Compiler**: memoises your components and works with the hooks as they
  are — nothing to change in your queries; an inline `select` gets memoised for free

---

# What we did NOT cover (and where to look)

- **`persistQueryClient`** with `@tanstack/react-query-persist-client` and
  `<PersistQueryClientProvider>`: the cache survives a reload
- **`streamedQuery`** (`@tanstack/query-core`): a query fed by a stream — an AI
  answer, server-sent events
- **React Native**: `focusManager` and `onlineManager` wired to `AppState` and
  NetInfo — the cache code is the same
- **TanStack Router**: loaders built around `ensureQueryData`, typed end to end
