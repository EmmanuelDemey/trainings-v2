# Workshop 05 — Optimistic updates and rollbacks

> Closing an issue waits for the server, then for the refetch, before anything
> moves. Creating one shows nothing for a round trip. Make both instant — and
> safe when the server says no.

## Goal

Chapter 05 — The two ways to be optimistic:

- **Through the cache**: `onMutate` writes the expected result into every cached
  list, and `onError` puts the snapshot back
- **Through the UI**: the mutation's `variables`, rendered while it is pending —
  nothing to roll back
- **When to return the invalidation**, and when not to

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 05 of the deck; workshop 04 done, or not — this starter contains its
  solution, with a **Close** / **Reopen** button per row instead of **Delete**

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the shared spec
npm run test:watch
npm run typecheck
```

The spec, **`src/tests/shared/workshop.spec.ts`**, is red on the starter. Its
step 2 is green from the start — the starter never moves the issue, so it has
nothing to roll back. It is the guard rail: an optimistic update without its
rollback turns it red.

> `src/api/` and `src/tests/shared/` are **shared copies**: do not edit them.

**The bugs you are about to fix**, all visible on the page as shipped:

- Latency 1500 ms, **Close** an issue: nothing moves for 3 seconds — the `PATCH`,
  then the refetch.
- Create an issue: nothing for a round trip, then it appears.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `onMutate`: cancel, snapshot, write every list | `queries/issues.ts` | `npm test` — step 1 green: the issue leaves before the server answers |
| 2 | `onError` rolls back, `onSettled` invalidates without returning | `queries/issues.ts` | `npm test` — step 2 still green, with the optimistic update |
| 3 | `pending-issue` from the mutation's `variables` | `queries/issues.ts`, `NewIssueForm.tsx` | `npm test` — all green |

## Steps

### 1. Optimistic through the cache — `queries/issues.ts`

In `useSetIssueStatus()`, add an `onMutate: async ({ id, status }) => { … }`:

1. `await queryClient.cancelQueries({ queryKey: issueKeys.all })` — a refetch
   already in flight would land **after** your write and put the old status back.
2. `const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`
   — every cached list, as `[key, data]` pairs.
3. Write every list: `queryClient.setQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() }, (issues) => …)`
   sets the new status of the issue wherever it is; then
   `queryClient.setQueryData<IssueSummary[]>(issueKeys.list(leaving), …)` removes it
   from the list filtered on the status it leaves. Updaters must not mutate:
   `map` and `filter` return new arrays.
4. `return { snapshot };` — what `onMutate` returns reaches `onError` and
   `onSettled` as `onMutateResult`.

**Check it**: latency 1500 ms, **Close** an issue: it leaves the list and the
counter drops at once, while the Network panel shows the `PATCH` in flight.

→ **Done when** the step 1 spec is green.

### 2. The rollback — `queries/issues.ts`

Tick **The server refuses every write** and close an issue: it leaves… and never
comes back. Step 2 of the spec is red now.

1. `onError: (_error, _variables, onMutateResult) => …` — put every list of
   `onMutateResult?.snapshot` back with `queryClient.setQueryData(key, data)`.
   `onMutateResult` may be `undefined`: `onMutate` itself can throw.
2. Replace `onSuccess` by `onSettled: () => { void queryClient.invalidateQueries({ queryKey: issueKeys.all }); }`
   — success or failure, the server has the last word. This time **do not return**
   the promise: the screen is already right (or rolled back), and returning it
   would keep the mutation pending — and its error hidden — until the refetch is
   back.
3. `toggle-error` is already wired to the mutation's `error` in `IssueList.tsx`.

**Check it**: with the failure switch on, close an issue: it leaves, comes back,
and the error shows.

→ **Done when** steps 1 and 2 of the spec are green.

### 3. Optimistic through the UI — `queries/issues.ts`, `NewIssueForm.tsx`

A new issue has no id until the server gives it one: writing it into the cache
means inventing one. Show it from the mutation instead.

1. In `useCreateIssue()`, replace `onSuccess` by `onSettled` — still **returned**:
   the pending row must stay until the real one is in the list, or the issue
   would vanish for a round trip.
2. In `NewIssueForm.tsx`, read `variables` from the hook and, while `isPending`,
   render `<li className="pending" data-testid="pending-issue">{variables.title}</li>`
   (in a `<ul className="issues">`). TypeScript knows `variables` is defined when
   `isPending` is true.

**Check it**: latency 1500 ms, create an issue: it shows at once, greyed out, and
is replaced by the real row — with its id — when the refetch lands.

→ **Done when** `npm test` is fully green.

### 4. *(Bonus)* The pending row from another component

Render the pending row in `IssueList.tsx` instead, with
`useMutationState({ filters: { mutationKey: issueMutationKeys.create(), status: 'pending' }, select: (mutation) => mutation.state.variables })`.
It returns an array: several creations can be in flight at once.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Closing an issue moves it before the `PATCH` comes back
- [ ] With the failure switch on, the issue comes back and the error shows
- [ ] A new issue shows at once, greyed out, until the real row replaces it
- [ ] The devtools show the lists rewritten at the click, and refetched after

**You can explain**

- [ ] Why `onMutate` cancels the queries before writing
- [ ] Why the snapshot covers every list, not only the one on screen
- [ ] Why `onSettled` returns the invalidation for the creation, and not for the
      status change
- [ ] When you would choose the UI way over the cache way

## Going further

- Close two issues quickly, the second one failing. What does the rollback of the
  second put back? How would you guard against it (look at
  `queryClient.isMutating({ mutationKey })` before invalidating)?
- `scope: { id: 'issues' }` on the mutation runs them one after the other. What
  does it change for the user?
