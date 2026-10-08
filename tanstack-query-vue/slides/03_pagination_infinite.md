---
layout: cover
---

# 03 - Paginated and infinite queries

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Page** through a list with a `ref` in the key, without the table emptying
  at every click — `keepPreviousData`, `isPlaceholderData`
- **Prefetch** the next page from a component, with `watch` and
  `prefetchQuery`
- **Build** an infinite feed with `useInfiniteQuery` and
  `infiniteQueryOptions`, and render its pages in a template

---
src: ../../tanstack-query-common/slides/03_pagination_infinite/paginated.md
---

---

# A paginated table, in Vue

```vue
<script setup lang="ts">
const page = ref(1);
const queryClient = useQueryClient();

const { data, isPending, isPlaceholderData } = useQuery(() => ({
  ...issuePageQuery(page.value),
  placeholderData: keepPreviousData,
}));

// Once a page is ON SCREEN, fetch the next one into the cache
watch(data, (current) => {
  if (current && current.page < current.totalPages) {
    void queryClient.prefetchQuery(issuePageQuery(current.page + 1));
  }
}, { immediate: true });
</script>

<template>
  <p v-if="isPending">Loading…</p>
  <table v-else :class="{ dimmed: isPlaceholderData }">…</table>
  <span>Page {{ data?.page ?? page }} / {{ data?.totalPages ?? '…' }}</span>
  <button :disabled="isPlaceholderData || page >= (data?.totalPages ?? 1)" @click="page++">Next</button>
</template>
```

- `page` is client state — a `ref`, or the URL (`route.query.page`): the key
  follows it through the getter
- `prefetchQuery` is marked **deprecated** in 5.10x (→ `queryClient.query(…)`,
  next major) — still the name used today
- `watch(data)`, not `watch(page)`: while page 3 is a placeholder, `data` is
  still page 2 — and page 3 is already on its way

---
src: ../../tanstack-query-common/slides/03_pagination_infinite/infinite.md
---

---

# `useInfiniteQuery` — the composable

```ts
// src/queries/activity.ts
export function activityFeedQuery() {
  return infiniteQueryOptions({
    queryKey: activityKeys.feed(),
    queryFn: ({ pageParam }) => fetchActivity(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
```

```vue
<script setup lang="ts">
const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(activityFeedQuery());
const events = computed(() => data.value?.pages.flatMap((page) => page.items) ?? []);
</script>

<template>
  <ul><li v-for="event in events" :key="event.id">{{ event.message }}</li></ul>
  <p v-if="isFetchingNextPage">Loading more…</p>
  <button v-if="hasNextPage" :disabled="isFetchingNextPage" @click="fetchNextPage()">Load more</button>
</template>
```

- `infiniteQueryOptions` is to `useInfiniteQuery` what `queryOptions` is to
  `useQuery`: key, fetcher and page params together, typed
- `fetchNextPage` is a **function** (no `.value`); `hasNextPage` and
  `isFetchingNextPage` are refs

---

# Infinite scroll — a sentinel and VueUse

```vue
<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';

const sentinel = useTemplateRef<HTMLElement>('sentinel');

useIntersectionObserver(sentinel, ([entry]) => {
  if (entry?.isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
    void fetchNextPage();
  }
});
</script>

<template>
  <ul><li v-for="event in events" :key="event.id">{{ event.message }}</li></ul>
  <div ref="sentinel" />
</template>
```

- The guard matters: the sentinel can stay visible while the next page loads,
  and by default (`cancelRefetch: true`) a second `fetchNextPage()` **cancels**
  the one in flight and starts over — a storm of requests, none finishing
- `fetchNextPage({ cancelRefetch: false })` ignores calls while one runs — the
  guard says the same thing, in the component
- Thousands of rows: pair it with `maxPages`, or a virtual list
  (`@tanstack/vue-virtual`)

---
layout: cover
---

# Hands-on

## Workshop 03 — Paginated and infinite queries
