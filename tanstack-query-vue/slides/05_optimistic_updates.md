---
layout: cover
---

# 05 - Optimistic updates and rollbacks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** between the two optimistic ways: through the UI (`variables`)
  or through the cache (`onMutate`)
- **Write** the cache recipe in a composable — cancel, snapshot, write,
  roll back, converge
- **Show** the pending write and the failure in a Vue template, from the
  mutation's refs

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/two-ways.md
---

---

# Through the UI — `variables` in the template

```vue
<script setup lang="ts">
const title = ref('');
const { mutate: create, isPending, variables, error } = useCreateIssue();
</script>

<template>
  <ul class="issues">
    <IssueRow v-for="issue in issues" :key="issue.id" :issue="issue" />
    <!-- the optimistic row: what is being sent, greyed out -->
    <li v-if="isPending && variables" class="pending">{{ variables.title }}</li>
  </ul>
  <p v-if="error">{{ error.message }}</p>
</template>
```

- **No cache write**: nothing to roll back — on failure, `isPending` turns
  `false`, the row disappears, `error` shows
- `onSettled` **returns** the invalidation in the composable: the pending row
  stays until the refetched list holds the real one — never both, never neither
- From another component: `useMutationState` with the mutation's key (chapter 04)

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/via-cache.md
---

---

# Through the cache — the composable

```ts
export function useToggleIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.toggle(),
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => updateIssue(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: issueKeys.all });
      const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });
      for (const [queryKey, issues] of snapshot) {
        if (issues) queryClient.setQueryData(queryKey, applyStatus(issues, id, status, queryKey[2] as IssueFilter));
      }
      return { snapshot };
    },
    onError: (_error, _variables, onMutateResult) => {
      for (const [queryKey, issues] of onMutateResult?.snapshot ?? []) queryClient.setQueryData(queryKey, issues);
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: issueKeys.all }); },
  });
}
```

- `onMutateResult` is **inferred** from what `onMutate` returns — no annotation
- The component only calls `setStatus({ id, status })` and shows `error`: the
  cache surgery never leaves `src/queries/`

---

# What Vue does with the optimistic write

```text
click "Close #1"
  └─ onMutate → setQueryData(['issues','list','open'], without #1)
       └─ the query notifies its observers
            ├─ IssueList's useQuery   → data ref updated → the row leaves
            └─ OpenCounter's useQuery → select → 27     → the badge changes
```

- No store, no event: every component observing a written key re-renders —
  through the same refs as a fetch
- **Immutable** writes are what Vue needs too: a new array is a new `data`
  value, and structural sharing keeps the untouched rows **the same objects**
  — `v-for` with `:key` reuses their DOM
- Mutating the cached array in place changes the snapshot too — the rollback
  restores nothing — and the cache holds **raw** objects, not Vue's proxies:
  nothing tells the components it changed

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/rollback.md
---

---

# Showing the failure — in Vue

```vue
<script setup lang="ts">
const { mutate: setStatus, error: toggleError, reset } = useToggleIssue();
</script>

<template>
  <p v-if="toggleError" class="error" role="alert">
    {{ toggleError.message }}
    <button type="button" @click="reset()">Dismiss</button>
  </p>
</template>
```

- `error` is the error of the **last** `mutate()` of this observer — reset when
  the next one starts, or by `reset()`
- A toast for every failed write, wherever it comes from: a `MutationCache`
  with an `onError` in `createQueryClient()` (chapter 07)
- `role="alert"`: the rollback is visual; a screen-reader user needs the words

---
layout: cover
---

# Hands-on

## Workshop 05 — Optimistic updates and rollbacks
