---
layout: cover
---

# 02 - Query configuration

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Set** the freshness and the memory of the cache — `staleTime`, `gcTime` —
  app-wide in `createQueryClient()`, and per query in `useQuery`
- **Choose** the refetch triggers and the retries of a query
- **Hold** a query until its input exists, with `skipToken` or a reactive
  `enabled`
- **Show** something before the first answer — `initialData`,
  `placeholderData` — read from the cache with `useQueryClient`
- **Derive** with `select`, and keep big payloads cheap with `shallow`

---
src: ../../tanstack-query-common/slides/02_configuration/stale-gc.md
---

---

# Defaults, then overrides — on the Vue side

```ts
// src/queryClient.ts — the policy of the app
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: 5 * 60_000 },
    },
  });
}
```

```ts
// one query that needs another policy — spread, then override
const { data } = useQuery({
  ...issuesQuery('open'),
  staleTime: Infinity,          // this observer considers it fresh until invalidated
});
```

- `createQueryClient()` is used by `main.ts` **and** by the specs
  (`render.ts`): the workshop's defaults are tested as they ship
- `staleTime` is read **per observer**: two components on the same key can
  disagree about freshness — the shortest one refetches
- `queryClient.setQueryDefaults(issueKeys.all, { staleTime: 60_000 })`: defaults
  for every key under a prefix (chapter 07)

---
src: ../../tanstack-query-common/slides/02_configuration/refetch-triggers.md
---

---

# Reactive options — a getter re-evaluates them all

```ts
const props = defineProps<{ live: boolean }>();

const { data: openCount } = useQuery(() => ({
  ...issuesQuery('open'),
  // Polling only while the "live" toggle is on — re-read when the prop changes
  refetchInterval: props.live ? 5_000 : false,
  refetchOnWindowFocus: 'always',
  select: (issues) => issues.length,
}));
```

- With a **getter**, every option is re-evaluated when what it reads changes —
  not only the key: `refetchInterval`, `enabled`, `staleTime`…
- With a **plain object**, only refs **inside** it react (`queryKey`
  entries, `enabled: someRef`); the rest is read once
- A new options object does not mean a new query: same key, same query — the
  observer just gets its new options (`observer.setOptions`)

---
src: ../../tanstack-query-common/slides/02_configuration/retry.md
---

---
src: ../../tanstack-query-common/slides/02_configuration/initial-placeholder.md
---

---

# `placeholderData` from the list — in a component

```vue
<script setup lang="ts">
const props = defineProps<{ issueId: number | undefined }>();
const queryClient = useQueryClient();          // in setup, not in the callback

function summaryFromLists(id: number | undefined): Issue | undefined {
  if (id === undefined) return undefined;
  for (const [, issues] of queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })) {
    const summary = issues?.find((issue) => issue.id === id);
    if (summary) return { ...summary, description: '', createdAt: '', updatedAt: '' };
  }
}

const { data: issue, isPlaceholderData } = useQuery(() => ({
  ...issueQuery(props.issueId),
  placeholderData: () => summaryFromLists(props.issueId),
}));
</script>

<template>
  <h3 v-if="issue">{{ issue.title }}</h3>
  <p v-if="isPlaceholderData">Loading the description…</p>
  <p v-else-if="issue">{{ issue.description }}</p>
</template>
```

- `useQueryClient()` `inject`s the client: call it **during setup**, keep the
  reference, use it in callbacks

---
src: ../../tanstack-query-common/slides/02_configuration/enabled-select.md
---

---

# `enabled` and `skipToken` — the Vue way

```ts
const props = defineProps<{ issueId: number | undefined }>();

// enabled: a ref, a getter, or a boolean inside a getter for the whole options
useQuery({
  queryKey: ['issues', 'detail', () => props.issueId],
  queryFn: () => fetchIssue(props.issueId!),            // the `!` you have to trust
  enabled: () => props.issueId !== undefined,
});

// skipToken: decided where the id is known — no `!`
export function issueQuery(id: number | undefined) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: id === undefined ? skipToken : () => fetchIssue(id),
  });
}
useQuery(() => issueQuery(props.issueId));
```

- `enabled` is the one option the adapter calls if it is a function: a **getter**
  is tracked, like a ref
- Disabled is not loading: `isPending` is `true` while there is no data — use
  `isLoading` (`isPending && isFetching`) or test the input itself
  (`v-if="issueId === undefined"`)

---

# `select` and `shallow` — what Vue makes reactive

```ts
const { data: openCount } = useQuery({
  ...issuesQuery('open'),
  select: (issues) => issues.length,     // the component gets a number
});

const { data: bigExport } = useQuery({
  ...exportQuery(),
  shallow: true,                         // data in a shallow ref: no deep proxy
});
```

- The result is a **`reactive`** state: by default, `data` is made **deeply**
  reactive — every object of a 5 000-row payload wrapped in a proxy on access
- `shallow: true` — the result in a **`shallowReactive`**: `data` is replaced,
  never mutated, so deep reactivity buys nothing. Also in `defaultOptions`
- `select` runs on the cached data and returns what the component needs: a
  refetch that brings the same count does not change `data`

---
layout: cover
---

# Hands-on

## Workshop 02 — Query configuration
