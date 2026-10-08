# Workshop 05 — Optimistic updates and rollbacks

> Close an issue: nothing moves for a full second — the `PATCH`, then the
> refetch. Create one: nothing until the server answered. Make both instant,
> and make the instant safe: when the server says no, everything goes back,
> and the user is told.

## Goal

Chapter 05 — Optimistic updates and rollbacks:

- **Optimistic through the cache**: `onMutate` cancels, snapshots, writes,
  returns the snapshot
- **The rollback**: `onError` restores, `onSettled` converges
- **Optimistic through the UI**: the mutation's `variables`, shown while
  `isPending`
- *(Bonus)* **`useMutationState`**: the pending row, from another component

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 05 of the deck. The starter builds on the solution of workshop 04,
  with the filters of workshop 01 back — closing **and** reopening.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch
npm run typecheck    # vue-tsc --noEmit
```

**Do not edit** `src/api/` nor `src/tests/shared/`: copies of
`tanstack-query-common/`, shared with the React and Angular trainings. The
spec renders your app through `src/tests/render.ts`.

The test ids:

| Test id | What |
|---|---|
| `issue-<id>`, `toggle-<id>` | a row, and its "Close" / "Reopen" button |
| `toggle-error` | why the last status change failed |
| `open-count` | the header counter |
| `filter-open`, `filter-closed`, `filter-all` | the filters (default: `open`) |
| `new-title`, `create-submit` | the creation form of workshop 04 |
| `pending-issue` | the issue being created — its title, greyed out |

**The bugs you are about to fix**:

- **Close** waits for the `PATCH` **and** the refetch before the row moves —
  1.5 s with the latency at 1500 ms.
- **Create** shows nothing until the `POST` and the refetch are back.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `onMutate`: cancel, snapshot, write, return | `queries/issues.ts` | The row moves on click — spec "step 1" green |
| 2 | `onError` rolls back, `onSettled` invalidates | `queries/issues.ts` | With writes refused, the row comes back and `toggle-error` shows — spec "step 2" green |
| 3 | The pending row, from `variables` | `queries/issues.ts`, `NewIssueForm.vue` | `npm test` all green |

## Steps

### 1. Optimistic through the cache — `queries/issues.ts`

In `useToggleIssue()`, replace `onSuccess` with an `onMutate`:

```ts
onMutate: async ({ id, status }) => {
  await queryClient.cancelQueries({ queryKey: issueKeys.all });

  const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });

  for (const [queryKey, issues] of snapshot) {
    if (!issues) continue;
    const filter = queryKey[2] as IssueFilter; // ['issues', 'list', filter]
    queryClient.setQueryData<IssueSummary[]>(queryKey, applyStatus(issues, id, status, filter));
  }

  return { snapshot };
},
```

1. **Cancel** first, and `await` it: a refetch already in flight carries the
   old status, and would land **after** your write.
2. **Snapshot** every cached list — what the rollback puts back.
3. **Write** into every list. Write `applyStatus` yourself: `map` the issue to
   its new status, then, unless the filter is `all`, `filter` out the issues
   whose status no longer matches. **Immutably** — new arrays, new objects:
   the snapshot holds the old references, and the rollback needs them
   untouched. (`setQueriesData` writes one updater into every match, but the
   updater does not get the key — and here each list's filter matters.)
4. **Return** the snapshot: it reaches `onError` and `onSettled`.

The counter follows on its own: it reads the same `['issues', 'list', 'open']`.

**Check it**: latency at 3000 ms, **Close** an issue: the row leaves and the
counter drops at once, while the `PATCH` is still in flight in the Network panel.

→ **Done when** the spec "step 1 — an optimistic update through the cache" is green.

### 2. The rollback — `queries/issues.ts`

```ts
onError: (_error, _variables, onMutateResult) => {
  for (const [queryKey, issues] of onMutateResult?.snapshot ?? []) {
    queryClient.setQueryData(queryKey, issues);
  }
},
onSettled: () => {
  void queryClient.invalidateQueries({ queryKey: issueKeys.all });
},
```

- `onError` gets what `onMutate` returned as its third argument — typed from
  it, no annotation needed.
- `onSettled` runs on success **and** on failure: the server has the last word.
  This time the promise is **not** returned: the screen is already right (or
  rolled back), and returning it would keep the mutation `pending` — and its
  `error` hidden — until the refetch is back.

The list already shows `toggle-error` from the mutation's `error`.

**Check it**: tick **The server refuses every write**, **Close** an issue: it
leaves, comes back, and the error shows. The counter goes 28 → 27 → 28.

→ **Done when** the spec "step 2 — the rollback" is green (it was green on the
starter, which never moved anything: it is the guard rail of step 1).

### 3. Optimistic through the UI — `queries/issues.ts`, `NewIssueForm.vue`

No cache write for the creation — the new issue has no id yet. Show what is
being sent instead:

1. In `useCreateIssue()`, move the invalidation from `onSuccess` to
   `onSettled`, **still returned**: the mutation — and the pending row — stays
   until the lists are refetched and the real row is there, success or failure.
2. In `NewIssueForm.vue`, take `variables` from `useCreateIssue()`, and render
   it while `isPending`:

   ```vue
   <ul v-if="isPending && variables" class="issues">
     <li class="pending" data-testid="pending-issue">{{ variables.title }}</li>
   </ul>
   ```

Nothing to roll back: on failure, `isPending` turns false, the row disappears,
and `create-error` shows.

**Check it**: latency at 3000 ms, create an issue: the greyed-out row at once,
then the real one, `#43`, replaces it — never both, never neither.

→ **Done when** `npm test` is all green.

### 4. *(Bonus)* The pending row, from another component

Move the pending row to `IssueList.vue`, which never calls `mutate()`:

```ts
const pendingTitles = useMutationState({
  filters: { mutationKey: issueMutationKeys.create(), status: 'pending' },
  select: (mutation) => (mutation.state.variables as { title: string }).title,
});
```

Two creations in flight? Two pending rows.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No Vue warning in the browser console

**The behaviour is there**

- [ ] Closing or reopening an issue moves it before the `PATCH` comes back,
      in every filter
- [ ] With writes refused, the issue comes back, the counter too, and
      `toggle-error` says why
- [ ] A new issue shows greyed out at once, and is replaced by the real row
- [ ] The cache logic lives in `src/queries/issues.ts`: the components only
      call `mutate()`

**You can explain**

- [ ] Why `onMutate` cancels before it writes, and why it awaits it
- [ ] Why the write must be immutable
- [ ] Why `onSettled` returns the invalidation for the creation, and not for
      the toggle
- [ ] When to choose the UI way (`variables`) over the cache way

## Going further

- Click **Close** on three issues quickly, with the latency at 3000 ms and
  writes refused. Does every rollback restore the right state? Read the
  "Concurrent optimistic mutations" slide, and invalidate only when
  `queryClient.isMutating({ mutationKey: issueMutationKeys.toggle() }) === 1`.
- Turn the rollback into an **undo**: a toast "Issue closed — Undo" that sends
  the inverse `PATCH`.
- Make the toggle optimistic in the detail of workshop 02 too: one more key to
  snapshot, another shape to write.
