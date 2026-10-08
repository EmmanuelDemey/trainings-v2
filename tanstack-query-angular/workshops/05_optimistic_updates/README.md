# TP 05 — Optimistic updates and rollbacks

> Every write now goes through TanStack Query — and every write makes you wait
> for a round trip, sometimes two. Make the screen move at the click, and put it
> back honestly when the server says no.

## Goal

Chapter 05 — Optimistic updates, both ways:

- **Through the cache**: close / reopen an issue — `onMutate` cancels, snapshots,
  writes every cached list
- **The rollback**: `onError` restores the snapshot and says so; `onSettled`
  lets the server have the last word
- **Through the UI**: show the issue being created, greyed out, from the
  mutation's `variables()`

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Workshop 04, or its solution: this starter is the solution of 04, plus a
  **Close / Reopen** button (`toggle-<id>`) on every row

## Setup

```bash
npm install
npm run dev          # http://localhost:4200
npm test             # ng test --watch=false — red on the starter
npm run test:watch
npm run typecheck
```

The spec is **`src/tests/shared/workshop.spec.ts`**; `src/api/` and
`src/tests/shared/` are shared copies: do not edit them.

> The step 2 spec is **green on the starter** — which never moves the issue in
> the first place. It is the guard rail of step 2: an optimistic update without
> its rollback turns it red.

**The bugs you are about to fix**, all visible as shipped:

- With a 1500 ms latency, **Close** an issue: nothing moves until the `PATCH`
  **and** the refetch are back.
- Create an issue: nothing shows until the refetch — the user wonders whether
  the click worked.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `onMutate`: cancel, snapshot, write every cached list | `issues/issue-mutations.ts` | The issue leaves at the click; step 1 green |
| 2 | `onError` rolls back; `onSettled` invalidates | `issues/issue-mutations.ts` | A refused change puts the issue back; step 2 still green |
| 3 | The pending creation from `variables()` | `issues/new-issue-form.ts` | `npm test` — all green |

## Steps

### 1. Through the cache — `issue-mutations.ts`

In `injectSetIssueStatus()`:

1. Write a helper `withStatus(issues, id, status, filter)`: the list with the
   issue's new status — and without it if it no longer matches the list's filter
   (`'all'` keeps everything).
2. `onMutate: async ({ id, status }) => { … }`:
   - `await queryClient.cancelQueries({ queryKey: issueKeys.all })` — a refetch in
     flight would land after your write and put the old status back;
   - `const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`;
   - for each `[queryKey, issues]` of the snapshot, `queryClient.setQueryData(queryKey, withStatus(…))`
     — the filter is the last part of the key, `['issues', 'list', filter]`;
   - `return { snapshot };`
3. Remove the `onSuccess`.

Why `setQueryData` per key and not one `setQueriesData`? Its updater receives the
data, not the key — and the "open" list must lose the issue while "all" keeps it.

**Check it**: latency 1500 ms, **Close** issue 1: it leaves the list and the
counter drops **at the click**; the `PATCH` is still in flight in the Network panel.

→ **Done when** the step 1 spec is green.

### 2. The rollback — `issue-mutations.ts`

1. `onError: (_error, _variables, onMutateResult) => …`: put every
   `[queryKey, issues]` of `onMutateResult?.snapshot` back with `setQueryData`.
   `onMutateResult` is typed from what `onMutate` returned.
2. `onSettled: () => { void queryClient.invalidateQueries({ queryKey: issueKeys.all }); }`
   — success or failure, the server has the last word. **Not** returned: the
   screen is already right (or rolled back), so the mutation settles — and shows
   its error — now, not after the refetch.
3. `toggle-error` already reads `setStatus.isError()` in `IssueList`.

**Check it**: tick **The server refuses every write**, **Close** an issue: it
leaves, comes back, and the error shows.

→ **Done when** the step 2 spec is green (with step 1 still green).

### 3. Through the UI — `new-issue-form.ts`

1. `@if (createIssue.isPending())`, render
   `<li class="pending" data-testid="pending-issue">{{ createIssue.variables() }}</li>`
   — what was **sent**, greyed out.
2. Nothing is written to the cache: nothing to roll back. On error the row goes,
   and `create-error` explains.

Because `onSuccess` **returns** the invalidation, the mutation stays pending
until the real row — with its id — is in the list: the pending row never
disappears before its replacement shows up.

**Check it**: latency 1500 ms, create an issue: the greyed row at once, then the
real one, `#43`.

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src/app` returns nothing

**The behaviour is there**

- [ ] Closing an issue moves it and the counter before the `PATCH` comes back
- [ ] With the failure switch on, the issue comes back and `toggle-error` shows
- [ ] A creation shows a greyed row at once, replaced by the real one
- [ ] After any toggle, the lists end up as the server has them (watch the refetch)

**You can explain**

- [ ] Why `onMutate` cancels before writing
- [ ] Why `onSettled` here does **not** return the promise, while the creation's `onSuccess` does
- [ ] Through the cache vs through the UI: when to choose which
- [ ] What happens to the snapshot if two toggles overlap

## Going further

- *(Bonus)* Show the pending row **in the list** instead of the form, with
  `injectMutationState(() => ({ filters: { mutationKey: issueMutationKeys.create(), status: 'pending' }, select: (m) => m.state.variables as string }))`.
- Toggle three issues fast with a 3000 ms latency: each `onSettled` invalidates.
  Use `queryClient.isMutating({ mutationKey: issueMutationKeys.status() }) === 1`
  to invalidate only when the last one settles.
- Add a **Dismiss** button calling `setStatus.reset()`.
