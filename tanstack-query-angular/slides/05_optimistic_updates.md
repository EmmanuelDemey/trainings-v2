---
layout: cover
---

# 05 - Optimistic updates and rollbacks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** between the two optimistic updates: through the UI, or through the cache
- **Show** a pending creation from the mutation's `variables()` signal — in the
  form, or anywhere with `injectMutationState`
- **Write** the cache recipe in an inject function: cancel, snapshot, write,
  roll back, invalidate
- **Report** a failed optimistic write without losing the user's place

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/two-ways.md
---

---

# Through the UI — in an Angular template

```html
<!-- In the form: the mutation is right here -->
@if (createIssue.isPending()) {
  <li class="pending" data-testid="pending-issue">{{ createIssue.variables() }}</li>
}
```

```ts
// In the list: another component — read the mutation cache instead
export class IssueList {
  protected readonly pendingTitles = injectMutationState(() => ({
    filters: { mutationKey: issueMutationKeys.create(), status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  }));
}
```

```html
@for (title of pendingTitles(); track $index) { <li class="pending">{{ title }}</li> }
```

- Nothing is written to the cache: nothing to roll back. On error the row simply
  disappears — show the error next to the form
- `onSuccess` **returns** the invalidation: the row stays pending until the real
  one, with its id, is on screen

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/via-cache.md
---

---

# The recipe, as an inject function

```ts
export function injectSetIssueStatus() {
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationKey: issueMutationKeys.status(),
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => updateIssue(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: issueKeys.all });
      const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });
      for (const [queryKey, issues] of snapshot) {
        if (issues) queryClient.setQueryData(queryKey, withStatus(issues, id, status, filterOf(queryKey)));
      }
      return { snapshot };                       // typed: onError knows its shape
    },
    onError: (_error, _variables, onMutateResult) => {
      for (const [queryKey, issues] of onMutateResult?.snapshot ?? []) queryClient.setQueryData(queryKey, issues);
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: issueKeys.all }); },
  }));
}
```

- `inject(QueryClient)` **once**, outside the options function: the callbacks
  close over it

---
src: ../../tanstack-query-common/slides/05_optimistic_updates/rollback.md
---

---

# Showing the failure — signals again

```html
@if (setStatus.isError()) {
  <p role="alert" data-testid="toggle-error">
    {{ setStatus.error().message }}
    <button type="button" (click)="setStatus.reset()">Dismiss</button>
  </p>
}
```

- The rollback already put the row back: the message says **why** it moved back
- `reset()` clears `error()` — and the next `mutate()` clears it too
- One mutation per list, not per row: the last toggle's error is the one shown.
  Several in flight? `injectMutationState` with `status: 'error'` lists them all
- App-wide toasts: `new MutationCache({ onError })` on the client — see chapter 07
  for giving it an Angular service

---

## Workshop 05 — Optimistic updates and rollbacks
