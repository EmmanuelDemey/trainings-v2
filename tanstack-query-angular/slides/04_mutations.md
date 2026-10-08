---
layout: cover
---

# 04 - Mutations and callbacks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Write** data with `injectMutation`, and read its state as signals
- **Wrap** a mutation in your own `injectXxx()` function, the way the adapter does
- **Place** each callback where it belongs: in the options, or in `mutate()`
- **Keep** every screen honest with `invalidateQueries` — or `setQueryData`
- **Show** "Saving…" from anywhere with `injectIsMutating` and `injectMutationState`

---
src: ../../tanstack-query-common/slides/04_mutations/mutations.md
---

---

# `injectMutation`

```ts
export class NewIssueForm {
  private readonly queryClient = inject(QueryClient);
  protected readonly title = signal('');

  protected readonly createIssue = injectMutation(() => ({
    mutationKey: ['issues', 'create'],
    mutationFn: (title: string) => createIssue({ title }),
    onSuccess: () => this.queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  }));
}
```

```html
<form (submit)="submit($event)">
  <input #titleInput [value]="title()" (input)="title.set(titleInput.value)" />
  <button type="submit" [disabled]="createIssue.isPending()">Create</button>
</form>
@if (createIssue.isError()) { <p>{{ createIssue.error().message }}</p> }
```

- The same signals as a query: `isPending()`, `isError()`, `error()`, `data()`,
  `variables()`, `status()` — plus `mutate`, `mutateAsync` and `reset`
- `mutate()` never throws: errors land in `error()`. `mutateAsync()` returns the
  promise — and rejects: `await` it in a `try` / `catch`

---

# Your own inject functions

```ts
// src/app/issues/issue-mutations.ts
export function injectCreateIssue() {
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationKey: issueMutationKeys.create(),
    mutationFn: (title: string) => createIssue({ title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  }));
}
```

```ts
export class NewIssueForm {
  protected readonly createIssue = injectCreateIssue();   // a field: injection context ✅
}
```

- The Angular equivalent of a custom hook / composable: **a function that calls
  `inject`**, named `injectXxx` so everybody knows where it may be called
- The component no longer knows the key, the API, nor what to invalidate
- Shareable options without the injection: `mutationOptions({ mutationKey, mutationFn })`

---
src: ../../tanstack-query-common/slides/04_mutations/callbacks.md
---

---

# The callbacks of `mutate()` — in a component

```ts
protected submit(event: Event): void {
  event.preventDefault();
  this.createIssue.mutate(this.title(), {
    onSuccess: () => this.title.set(''),     // what only THIS form cares about
  });
}
```

- Options-level callbacks (in `injectMutation`) run **always** — the cache work
  goes there: invalidate, `setQueryData`, rollback
- `mutate()`-level callbacks run for **this call**, and only while the component
  that called `mutate` is still there: destroyed in between (a route change, an
  `@if` that flipped) — they are skipped
- Clear the input in `onSuccess` **only**: a refused write keeps what the user typed

---
src: ../../tanstack-query-common/slides/04_mutations/invalidation.md
---

---
src: ../../tanstack-query-common/slides/04_mutations/mutation-state.md
---

---

# Mutation state, from anywhere — as signals

```ts
export class App {
  // how many mutations are in flight, in the whole app: Signal<number>
  protected readonly mutating = injectIsMutating();
  // or only some of them
  protected readonly deleting = injectIsMutating({ mutationKey: issueMutationKeys.delete() });
  // queries too: Signal<number>
  protected readonly fetching = injectIsFetching();

  // the variables of every pending creation — from a component that did not create them
  protected readonly pendingTitles = injectMutationState(() => ({
    filters: { mutationKey: issueMutationKeys.create(), status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  }));
}
```

```html
@if (mutating() > 0) { <span data-testid="saving">Saving…</span> }
```

- `injectIsMutating` / `injectIsFetching` take the **filters** directly;
  `injectMutationState` takes a **function** — like `injectQuery`

---

## Workshop 04 — Mutations and callbacks
