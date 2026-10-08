---
layout: cover
---

# 07 - TanStack Query in a large application

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Organise** queries as composables, one resource module per feature
- **Route** errors: global handlers, `throwOnError`, Vue's `onErrorCaptured`
- **Prefetch** in vue-router guards with `ensureQueryData`, and suspend with
  `suspense()` and `<Suspense>`
- **Split** the state between Pinia and TanStack Query, and know what changes
  with Nuxt

---
src: ../../tanstack-query-common/slides/07_at_scale/organization.md
---

---

# The Vue resource module — composables

```
src/features/issues/
  api.ts            fetchIssues, createIssue…          the transport
  queries.ts        issueKeys, issuesQuery(), issueQuery()   keys + options (no Vue)
  composables.ts    useIssues(), useIssue(), useCreateIssue(), useToggleIssue()
  components/       IssueList.vue, IssueDetail.vue…    only call composables
```

```ts
// composables.ts — a composable per use, taking refs, getters or values
export function useIssue(id: MaybeRefOrGetter<number | undefined>) {
  return useQuery(() => issueQuery(toValue(id)));
}
```

- `queries.ts` holds **options**, not composables: the router guard, the
  prefetch, the tests and `useQuery` all use the same `issueQuery(id)`
- Composables are the **unit of reuse** in Vue: one place for the
  `useQueryClient()` + `useMutation` + callbacks of a write
- Components never import `api.ts` — easy to enforce with an ESLint
  `no-restricted-imports` rule

---
src: ../../tanstack-query-common/slides/07_at_scale/defaults-errors.md
---

---

# Errors, the Vue way

```ts
// createQueryClient() — one toast for every failed write, whoever wrote
new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (mutation.meta?.silent) return;
      toast.error(error.message);
    },
  }),
});
```

```vue
<!-- ErrorBoundary.vue — catches what a descendant throws -->
<script setup lang="ts">
const error = ref<Error | null>(null);
onErrorCaptured((caught) => {
  error.value = caught as Error;
  return false;               // stop the propagation to app.config.errorHandler
});
</script>
<template>
  <slot v-if="!error" />
  <p v-else role="alert">{{ error.message }}</p>
</template>
```

- `throwOnError: true` on a query: the adapter **throws** the error from a
  watcher of the component — `onErrorCaptured` in an ancestor catches it
- Uncaught, it reaches `app.config.errorHandler`: the place to report to Sentry

---
src: ../../tanstack-query-common/slides/07_at_scale/prefetching.md
---

---

# Prefetching in vue-router

```ts
// router.ts
{
  path: '/issues/:id',
  component: () => import('./IssueDetailPage.vue'),
  beforeEnter: async (to) => {
    const queryClient = useQueryClient();          // guards run in the app's injection context
    await queryClient.ensureQueryData(issueQuery(Number(to.params.id)));
  },
}
```

- `ensureQueryData`: the cached data if any (fresh or not), otherwise **fetch
  and wait** — the page renders with its data, no "Loading…"
- `prefetchQuery` instead, without `await`: start the request, don't block the
  navigation — the page shows its pending state for less time
- The component then calls `useQuery(() => issueQuery(Number(route.params.id)))`
  — same options, same key: it reads what the guard put in the cache
- 5.10x marks `ensureQueryData` / `prefetchQuery` **deprecated**, in favour of
  `queryClient.query({ ...options, staleTime: 'static' })` / `queryClient.query(options)`
- `useQueryClient()` works in a guard because Vue Router runs guards inside
  `app.runWithContext()`; otherwise, export the client from a module

---

# `suspense()` and `<Suspense>`

```vue
<!-- IssueDetailPage.vue — an async setup -->
<script setup lang="ts">
const route = useRoute();
const { data: issue, suspense } = useQuery(() => issueQuery(Number(route.params.id)));

await suspense();      // setup waits: the component renders WITH its data
</script>

<template>
  <h1>{{ issue?.title }}</h1>
</template>
```

```vue
<!-- the parent -->
<Suspense>
  <IssueDetailPage />
  <template #fallback><p>Loading…</p></template>
</Suspense>
```

- `suspense()` resolves once the query has data (or at once if it is fresh); a
  top-level `await` makes the `<script setup>` **async** — it needs a
  `<Suspense>` above it
- `<Suspense>` is still **experimental** in Vue: one fallback for several async
  children is its strength — for a single query, `isPending` is simpler
- SSR: `onServerPrefetch(suspense)` makes the server wait for the query

---

# Pinia **and** TanStack Query

<div style="display: flex; gap: 2em;">
<div>

### Pinia — client state

- the selected filter, the open panels
- the logged-in user's preferences
- a draft, a wizard's steps
- **owned by the browser**: the source of truth is here

</div>
<div>

### TanStack Query — server state

- the issues, the activity, the counter
- **a copy** of what the server owns: stale, refetched, invalidated
- cached by key, shared by every component

</div>
</div>

```ts
// they meet in the key: the query follows the store
const filters = useIssueFiltersStore();
const { data } = useQuery(() => issuesQuery(filters.status));
```

- Smell: `store.issues = await fetchIssues()` in an action — you are writing
  a worse query cache
- Smell: `useQuery(...).data` copied into a store — two sources of truth

---

# Nuxt

```ts
// plugins/vue-query.ts
export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query');
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5_000 } } });

  nuxt.vueApp.use(VueQueryPlugin, { queryClient });

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => { vueQueryState.value = dehydrate(queryClient); });
  }
  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => { hydrate(queryClient, vueQueryState.value); });
  }
});
```

- The same `@tanstack/vue-query`, installed in a Nuxt plugin — a **new client
  per request** on the server (the plugin runs per request)
- In the pages: `onServerPrefetch(suspense)`, or `await suspense()` — the
  server renders with data, the client hydrates the cache instead of refetching
- A `staleTime` above 0: otherwise the client refetches what the server just sent

---
src: ../../tanstack-query-common/slides/07_at_scale/beyond.md
---
