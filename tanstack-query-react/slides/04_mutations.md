---
layout: cover
---

# 04 - Mutations and callbacks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Write** data with `useMutation`, wrapped in a hook of the resource module
- **Keep** every screen in sync with `invalidateQueries` — or `setQueryData`
- **Place** each callback where it belongs: the hook's, or `mutate()`'s
- **Read** the state of a mutation in its component, and of every mutation
  from anywhere with `useIsMutating` and `useMutationState`

---
src: ../../tanstack-query-common/slides/04_mutations/mutations.md
---

---

# `useMutation`, in a hook of its own

```ts
// queries/issues.ts
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['issues', 'create'],
    mutationFn: createIssue,                    // (input: { title: string }) => Promise<Issue>
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}
```

```tsx
// NewIssueForm.tsx
const { mutate, isPending, error } = useCreateIssue();

<form onSubmit={(event) => { event.preventDefault(); mutate({ title }); }}>
  <button disabled={isPending}>Create</button>
  {error && <p role="alert">{error.message}</p>}
</form>
```

- A hook, not `queryOptions`: it needs `useQueryClient()` for its callbacks
  (`mutationOptions(…)` exists too, for options shared without the client)
- Nothing runs on render: a mutation runs when **you** call `mutate`
- `variables`, `data`, `error`, `isPending`… describe the **last** call of
  **this** hook instance

---
src: ../../tanstack-query-common/slides/04_mutations/callbacks.md
---

---

# The callbacks of `mutate()`, in React

```tsx
mutate(
  { title },
  {
    // Runs AFTER the hook's onSuccess — and only if this component is still mounted
    onSuccess: () => setTitle(''),
    onError: (error) => titleRef.current?.focus(),
  },
);
```

- The hook's callbacks keep the **cache** right: they run whoever calls, whatever
  happens to the component
- `mutate()`'s callbacks drive **this screen**: navigate, close the dialog, reset
  the form. An unmounted component's callbacks are skipped — no "state update on
  an unmounted component"
- `mutateAsync` returns the promise — handle its rejection yourself, or it ends
  as an unhandled rejection

---
src: ../../tanstack-query-common/slides/04_mutations/invalidation.md
---

---
src: ../../tanstack-query-common/slides/04_mutations/mutation-state.md
---

---

# Mutation state across components, in React

```tsx
// In the header, far from the form and the rows
function SavingIndicator() {
  const saving = useIsMutating({ mutationKey: ['issues'] });   // a number
  return saving > 0 ? <span>Saving…</span> : null;
}
```

```tsx
// The titles being created right now, from any component
const pendingTitles = useMutationState({
  filters: { mutationKey: ['issues', 'create'], status: 'pending' },
  select: (mutation) => (mutation.state.variables as { title: string }).title,
});
```

- Both subscribe to the **mutation cache**: the component re-renders when a
  matching mutation starts or settles — not on every mutation of the app
- `useIsFetching({ queryKey })` is the same for queries: a global "busy" bar
- Keys are prefixes: `['issues']` matches `['issues', 'create']` and
  `['issues', 'delete']`

---

## Workshop 04 — Mutations
