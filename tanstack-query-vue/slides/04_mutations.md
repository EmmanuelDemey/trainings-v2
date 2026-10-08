---
layout: cover
---

# 04 - Mutations and callbacks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Write** data with `useMutation`, wrapped in a composable that owns the
  cache logic
- **Place** each callback: in `useMutation` (always runs) or in `mutate()`
  (this screen only)
- **Keep** every screen in sync with an invalidation — or with the server's
  answer
- **Show** what is being written, from anywhere: `useIsMutating`,
  `useIsFetching`, `useMutationState`

---
src: ../../tanstack-query-common/slides/04_mutations/mutations.md
---

---

# `useMutation` — in a composable

```ts
// src/queries/issues.ts
export function useCreateIssue() {
  const queryClient = useQueryClient();        // during setup: inject works here

  return useMutation({
    mutationKey: issueMutationKeys.create(),
    mutationFn: createIssue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}
```

```vue
<script setup lang="ts">
const title = ref('');
const { mutate: create, isPending, error, variables } = useCreateIssue();
</script>

<template>
  <form @submit.prevent="create({ title })">
    <input v-model="title" />
    <button :disabled="isPending">Create</button>
  </form>
  <p v-if="error">{{ error.message }}</p>
</template>
```

- Refs again — `isPending`, `error`, `data`, `variables`, `status` — plus
  `mutate`, `mutateAsync`, `reset` as functions
- The **composable** is the unit: the component says *what* to write, the
  composable knows *what it changes in the cache*

---
src: ../../tanstack-query-common/slides/04_mutations/callbacks.md
---

---

# The callbacks of `mutate()` — and the component's lifetime

```ts
function submit(): void {
  create(
    { title: title.value },
    {
      onSuccess: () => { title.value = ''; },          // this form only
      onError: (error) => toast.error(error.message),  // this screen only
    },
  );
}
```

- They run **after** the callbacks of `useMutation`, and only while the
  observer exists: the component unmounts (the user navigated away) — they are
  skipped
- So: the **cache** logic in `useMutation` (in the composable), the **UI**
  reactions in `mutate()`
- `mutateAsync` + `try / catch` in an `async` handler works too — and throws:
  catch it, or Vue reports an unhandled rejection to `app.config.errorHandler`

---
src: ../../tanstack-query-common/slides/04_mutations/invalidation.md
---

---
src: ../../tanstack-query-common/slides/04_mutations/mutation-state.md
---

---

# Global indicators — `useIsMutating`, `useIsFetching`

```vue
<!-- AppHeader.vue — knows neither the form nor the list -->
<script setup lang="ts">
import { useIsFetching, useIsMutating } from '@tanstack/vue-query';

const saving = useIsMutating();                                               // Ref<number>
const savingDeletes = useIsMutating({ mutationKey: issueMutationKeys.delete() });
const loading = useIsFetching();                                              // every query fetching
</script>

<template>
  <span v-if="saving > 0">Saving…</span>
  <div v-if="loading > 0" class="top-progress-bar" />
</template>
```

- Both return a **`Ref<number>`**, kept in sync with the mutation / query cache
- Their filters can be a **getter**, when they depend on other reactive state
- The header reads the caches, not the components: no event bus, no shared
  `ref` of "is something saving"

---

# `useMutationState` — the mutations of others

```ts
// IssueList.vue — never calls mutate(), still shows what is being created
const pendingTitles = useMutationState({
  filters: { mutationKey: issueMutationKeys.create(), status: 'pending' },
  select: (mutation) => (mutation.state.variables as { title: string }).title,
});
// Readonly<Ref<string[]>> — one entry per creation in flight
```

```vue
<li v-for="title in pendingTitles" :key="title" class="pending">{{ title }}</li>
```

- Every `mutate()` adds an entry to the **MutationCache** (kept for `gcTime`
  once settled): filter by key and status, `select` what you need
- Hence the `mutationKey`: without one, a mutation can only be found by
  reference
- Workshop 05 uses it for the optimistic row, as a bonus

---
layout: cover
---

# Hands-on

## Workshop 04 — Mutations and callbacks
