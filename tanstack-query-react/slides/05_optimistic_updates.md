---
layout: cover
---

# 05 - Optimistic updates and rollbacks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** between an optimistic update through the UI and through the cache
- **Render** a pending item from a mutation's `variables` — in its component, or
  in another one with `useMutationState`
- **Write** an optimistic update through the cache, with its snapshot and its
  rollback, in a React hook
- **Handle** concurrent optimistic mutations and show the failure to the user

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/two-ways.md
---

---

# Through the UI, in React

```tsx
function NewIssueForm() {
  const { mutate, isPending, variables } = useCreateIssue();
  return (
    <>
      {isPending && <li className="pending">{variables.title}</li>}
      {/* the form */}
    </>
  );
}
```

```ts
// useCreateIssue — the pending row must stay until the real one is in the list
onSettled: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),   // returned
```

- `variables` is typed `TVariables` once `isPending` narrowed the result: no `!`
- Elsewhere in the tree: `useMutationState({ filters: { mutationKey, status: 'pending' }, select: (m) => m.state.variables })`
  — an **array**, several creations can be in flight
- Nothing to roll back: when the mutation settles, the pending row simply stops
  being rendered

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/via-cache.md
---

---

# Through the cache, in React

```ts
export function useSetIssueStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: StatusChange) => updateIssue(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: issueKeys.all });
      const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });
      queryClient.setQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() }, (issues) =>
        issues?.map((issue) => (issue.id === id ? { ...issue, status } : issue)));
      return { snapshot };                                   // typed: reaches onError as is
    },
    onError: (_error, _variables, onMutateResult) => {
      for (const [key, issues] of onMutateResult?.snapshot ?? []) queryClient.setQueryData(key, issues);
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: issueKeys.all }); },
  });
}
```

- The component just calls `mutate` and renders `error` — it never sees the cache
- Every `useQuery` on those keys re-renders at once: list, counter, detail

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/rollback.md
---

---

# Showing the failure, in React

```tsx
const statusChange = useSetIssueStatus();

{statusChange.error && (
  <p role="alert" data-testid="toggle-error">
    Could not change the status: {statusChange.error.message}
    <button onClick={() => statusChange.reset()}>Dismiss</button>
  </p>
)}
```

- `reset()` clears the mutation's state — the error goes, the cache is untouched
- One hook instance per row (a `<IssueRow>` component) gives each row its own
  `isPending` and `error`; one instance for the list gives the **last** one only
- An app-wide toast for every failed write: `new MutationCache({ onError })` in
  the client — chapter 07

---

## Workshop 05 — Optimistic updates
