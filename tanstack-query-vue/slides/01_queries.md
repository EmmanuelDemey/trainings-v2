---
layout: cover
---

# 01 - Queries and query keys

## Fetching vs loading

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** server state from client state — and what belongs in a `ref`, in
  Pinia, and in the query cache
- **Read** data with `useQuery`, a **key factory** and `queryOptions`
- **Make a key follow** a `ref` or a prop — and explain why a getter reacts
  where a plain object does not
- **Use** the refs `useQuery` returns, and tell `isPending` from `isFetching`
  in a template

---
src: ../../tanstack-query-common/slides/01_queries/server-state.md
---

---

# In a Vue app: three homes for state

| State | Example | Home |
|---|---|---|
| Local UI state | the selected filter, an open modal, the text being typed | a `ref` in the component |
| Shared **client** state | the theme, the logged-in user's preferences, a cart before checkout | **Pinia** (or a composable with module-level refs) |
| **Server** state | the issues, the activity feed, the counter | **the query cache** |

- A Pinia store **can** hold the issues — and then you write the loading flags,
  the dedup, the staleness, the invalidation, the race guards… by hand
- TanStack Query does **not** replace Pinia: it removes the server state from
  it. What is left in the store is usually small
- Both together: a Pinia store holds the **filter**, `useQuery` reads it in its
  key — the query follows the store

---
src: ../../tanstack-query-common/slides/01_queries/query-keys.md
---

---

# `useQuery` — the composable

```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { issuesQuery } from '@/queries/issues';

const { data: issues, isPending, isFetching, error } = useQuery(issuesQuery('open'));
</script>

<template>
  <p v-if="isPending">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ul v-else>
    <li v-for="issue in issues" :key="issue.id">{{ issue.title }}</li>
  </ul>
</template>
```

- Every field of the result is a **`Ref`** (`toRefs` of a readonly reactive
  state): **destructuring is safe** — unlike a `reactive()` object
- In the template, refs unwrap: `issues`, `isPending`; in the script,
  `issues.value`
- `refetch`, `suspense` (and `fetchNextPage` for infinite queries) are plain
  **functions**, not refs
- Called **in `setup`** — it `inject`s the client and registers its cleanup on
  the component's scope (`onScopeDispose` unsubscribes the observer)

---
src: ../../tanstack-query-common/slides/01_queries/query-function.md
---

---

# A key that follows a `ref` — three ways

```ts
const filter = ref<IssueFilter>('open');

// 1. A GETTER for the whole options — the idiomatic way with queryOptions
useQuery(() => issuesQuery(filter.value));

// 2. A ref INSIDE the key — unwrapped by the adapter, tracked
useQuery({ queryKey: ['issues', 'list', filter], queryFn: () => fetchIssues(filter.value) });

// 3. A computed for the whole options
useQuery(computed(() => issuesQuery(filter.value)));

// ❌ Evaluated ONCE, during setup: a plain object, with 'open' in it forever
useQuery(issuesQuery(filter.value));
```

- The adapter resolves the options inside a **`computed`**: everything read
  there — a getter's body, a ref in the key — is **tracked**; a change builds a
  new key, and the observer switches to the new query
- `issuesQuery(filter.value)` is called **before** `useQuery` sees anything:
  `filter.value` is read outside any reactive context — a string, not a ref
- Props too: `useQuery(() => issueQuery(props.issueId))` — `props.x` is a
  reactive read

---

# `MaybeRefOrGetter` — composables that take anything

```ts
// src/queries/issues.ts
import { toValue, type MaybeRefOrGetter } from 'vue';

export function useIssues(filter: MaybeRefOrGetter<IssueFilter>) {
  return useQuery(() => issuesQuery(toValue(filter)));
}
```

```ts
useIssues('open');                  // a constant
useIssues(filterRef);               // a ref — or a Pinia store's ref
useIssues(() => props.filter);      // a prop, through a getter
useIssues(() => route.query.status as IssueFilter);   // the URL
```

- `toValue` unwraps a ref, calls a getter, returns a value as is — read
  **inside** the getter, so it is tracked
- The signature `useQuery` itself uses: `options: MaybeRefOrGetter<…>`
- The pattern of every composable library (VueUse): accept a value, a ref or a
  getter — never force the caller to wrap

---
src: ../../tanstack-query-common/slides/01_queries/statuses.md
---

---

# Fetching vs loading, in a template

```vue
<template>
  <div class="toolbar">
    <FilterButtons v-model="filter" />
    <!-- a request in flight, BEHIND data already shown -->
    <span v-if="isFetching && !isPending" class="muted">refreshing…</span>
  </div>

  <!-- nothing to show yet, for THIS key -->
  <p v-if="isPending">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <IssueRows v-else :issues="issues!" />
</template>
```

- `isPending` and `isFetching` are refs: the template re-renders when they flip
- Back on a filter already cached: `isPending` stays `false` — no "Loading…" —
  while `isFetching` is `true` during the background refetch
- TypeScript does not narrow `issues` from `isPending` across the template:
  `v-else` + `issues!`, or `v-else-if="issues"`

---

# `useQueries` — a dynamic number of queries

```ts
const selectedIds = ref<number[]>([1, 4, 7]);

const results = useQueries({
  queries: () => selectedIds.value.map((id) => issueQuery(id)),
  combine: (results) => ({
    issues: results.map((result) => result.data).filter(Boolean),
    isPending: results.some((result) => result.isPending),
  }),
});
// results.value.issues, results.value.isPending
```

- One observer per entry, each with its own key — shared with any `useQuery`
  on the same key
- `queries` can be a **getter** (or a ref / computed): add an id, one more query
- Returns **one ref** (of the array, or of what `combine` returns) — not
  an object of refs like `useQuery`
- For a list of a **fixed** size, several `useQuery` calls read better

---
layout: cover
---

# Hands-on

## Workshop 01 — First queries
