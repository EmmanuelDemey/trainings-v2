# Workshop 04 — Mutations and callbacks

> The open issues, a form to create one, a button to delete one. Both writes go
> straight to the API and tell nobody: the new issue never shows, the counter
> lies. Move them to mutations that keep every screen honest.

## Goal

Chapter 04 — Write data with **`useMutation`**:

- **A mutation that invalidates**: one `invalidateQueries` on the shared root
  key, and a component nobody told about the change refreshes anyway
- **The two levels of callbacks**: the hook's (the cache) and `mutate()`'s (this
  screen)
- **The state of a mutation**: `isPending`, `error` — no `useState` for them
- **Every mutation in flight, from anywhere**: `useIsMutating` and mutation keys

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 04 of the deck

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch
npm run typecheck
```

The spec, **`src/tests/shared/workshop.spec.ts`**, is red on the starter.

> `src/api/` and `src/tests/shared/` are **shared copies**: do not edit them.

**Already done for you**: the list and the counter read `issuesQuery('open')`
(workshop 01), the client has `staleTime: 30_000`, and `issueMutationKeys` in
`src/queries/issues.ts` names the mutations.

**The bugs you are about to fix**, all visible on the page as shipped:

- Create an issue: it never shows in the list, and the counter keeps saying 28 —
  `staleTime` keeps the old list for 30 s, and nobody invalidates it.
- Tick **The server refuses every write**, create an issue: nothing on screen.
  The error is an unhandled rejection in the console.
- Double-click **Create** with a 3000 ms latency: two issues.
- Delete an issue: it stays in the list.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `useCreateIssue()`: a mutation whose `onSuccess` returns the invalidation | `queries/issues.ts`, `NewIssueForm.tsx` | `npm test` — step 1 green: the new issue and `29 open` |
| 2 | `mutate(…, { onSuccess })` clears the input; `error` shows | `NewIssueForm.tsx` | `npm test` — step 2 green |
| 3 | `isPending` disables the button | `NewIssueForm.tsx` | `npm test` — step 3 green |
| 4 | `useDeleteIssue()` with a key, `useIsMutating` in the header | `queries/issues.ts`, `IssueList.tsx`, `SavingIndicator.tsx` | `npm test` — all green |

## Steps

### 1. A mutation that invalidates — `queries/issues.ts`, `NewIssueForm.tsx`

1. In `src/queries/issues.ts`, write `useCreateIssue()`:

   ```ts
   export function useCreateIssue() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationKey: issueMutationKeys.create(),
       mutationFn: createIssue,
       onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
     });
   }
   ```

   The arrow **returns** the promise of `invalidateQueries`: the mutation stays
   pending until the invalidated queries on screen have refetched.
2. In `NewIssueForm.tsx`, `const { mutate } = useCreateIssue();` and
   `mutate({ title })` in the submit handler — no `async`, no `await`.

**Check it**: create an issue. The Network panel shows `POST /issues`, then
`GET /issues?status=open` — ONE refetch, for two components. The counter says
`29 open`: the form knows nothing about it.

→ **Done when** the step 1 spec is green, and `NewIssueForm.tsx` imports nothing
from `../api/fakeApi`.

### 2. The callbacks of `mutate()` — `NewIssueForm.tsx`

There are two places for an `onSuccess`. The **hook's** runs for every caller and
keeps the **cache** right. **`mutate()`'s** is about **this screen**, and only
runs if the component is still mounted.

1. `mutate({ title }, { onSuccess: () => setTitle('') })` — the input is cleared
   only once the server accepted: a refused write keeps what the user typed.
2. Read `error` from the hook, and render `error.message` in
   `<p className="error" data-testid="create-error">` when there is one. It is
   reset by the next `mutate()`.

**Check it**: tick **The server refuses every write**, create an issue: the error
shows, the title stays. Untick it, submit again: the error goes, the input clears.

→ **Done when** the step 2 spec is green.

### 3. The state of a mutation — `NewIssueForm.tsx`

1. `disabled={isPending}` on `create-submit` — and "Creating…" as its label while
   it is pending, if you like.

**Check it**: latency 3000 ms, double-click **Create**: one `POST /issues`. The
button is disabled until the new issue is **in the list** — because `onSuccess`
returns the invalidation.

→ **Done when** the step 3 spec is green.

### 4. Every mutation in flight — `queries/issues.ts`, `IssueList.tsx`, `SavingIndicator.tsx`

1. Write `useDeleteIssue()`, like `useCreateIssue()`, around `deleteIssue`, with
   `mutationKey: issueMutationKeys.delete()`.
2. In `IssueList.tsx`, `const deletion = useDeleteIssue();` and
   `deletion.mutate(issue.id)` on click. Disable the button of the row on its way
   out: `deletion.isPending && deletion.variables === issue.id`.
3. In `SavingIndicator.tsx`, `useIsMutating({ mutationKey: issueMutationKeys.all })`
   counts the mutations in flight whose key starts with `['issues']`, whichever
   component started them. Above 0, render
   `<span className="muted" data-testid="saving">Saving…</span>`.

**Check it**: latency 1500 ms, delete an issue: "Saving…" in the header, until
the list is refetched. The devtools have a **Mutations** tab: find your two
mutations, their keys, their variables and their state.

→ **Done when** `npm test` is fully green.

### 5. *(Bonus)* No refetch: `setQueryData`

`createIssue` answers with the new issue. In `useCreateIssue`'s `onSuccess`, append
it to the cached open list with
`queryClient.setQueryData<IssueSummary[]>(issueKeys.list('open'), (issues) => …)`
instead of invalidating. What did you save, and what did you lose (the closed and
`all` lists, an issue another user created meanwhile)?

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Creating or deleting an issue updates the list AND the counter
- [ ] No component imports `createIssue` or `deleteIssue`
- [ ] A refused creation shows its error and keeps the title
- [ ] **Create** is disabled until the new issue is on screen
- [ ] "Saving…" shows in the header while any write is in flight

**You can explain**

- [ ] Why `onSuccess` **returns** `invalidateQueries`, and what changes if it does not
- [ ] When a callback belongs in the hook, and when in `mutate()`
- [ ] Why invalidating `['issues']` refetches the open list but not the closed one
      you never opened (or opened a minute ago)
- [ ] What a mutation key is for, since mutations are not cached

## Going further

- Replace `mutate` by `mutateAsync` in the form, with `try` / `catch`. What do you
  gain, and what must you now handle yourself?
- Move the shared `onSuccess` to the client:
  `queryClient.setMutationDefaults(issueMutationKeys.all, { onSuccess: … })`. Which
  one would you keep in a large codebase?
- `useMutationState({ filters: { mutationKey: issueMutationKeys.delete(), status: 'pending' }, select: (m) => m.state.variables })`
  — show the ids being deleted from any component.
