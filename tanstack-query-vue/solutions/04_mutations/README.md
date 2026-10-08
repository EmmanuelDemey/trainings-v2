# Workshop 04 — Mutations and callbacks

> The open issues, a form to create one, a button to delete one. Both write to
> the server by hand, and the screen never knows: the new issue does not show,
> the counter lies, a refused write loses what you typed. Move the writes to
> `useMutation`, and let the cache do the rest.

## Goal

Chapter 04 — Mutations and callbacks:

- **`useMutation`** in a composable, with an `onSuccess` that **returns** the
  invalidation
- **The callbacks of `mutate()`**: what concerns this screen only
- **The state of a mutation**: `isPending`, `error`, `variables`
- **`mutationKey`** and **`useIsMutating`**: "Saving…" in a header that knows
  nobody

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 04 of the deck

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
| `issue-<id>`, `delete-<id>` | a row of the open issues, and its "Delete" button |
| `open-count` | the header counter |
| `new-title`, `create-submit` | the input and the button of the form |
| `create-error` | why the creation failed |
| `saving` | in the header, while **any** mutation is in flight |

`createIssue({ title })` answers the new `Issue` (id 43 for the first one); a
blank title is refused with a 400. Tick **The server refuses every write** in
the Network panel to make every write fail with a 500.

**The bugs you are about to fix**:

- Create an issue: the `POST` succeeds (Network panel), and nothing changes —
  the list does not show it, the counter keeps saying 28.
- With the server refusing writes, the input is cleared anyway, and no error
  shows.
- Nothing stops a double submit.
- Delete an issue: the `DELETE` succeeds, the row stays.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `useCreateIssue()`: `useMutation` + invalidation | `queries/issues.ts`, `NewIssueForm.vue` | The new row AND the counter update — spec "step 1" green |
| 2 | The callbacks of `mutate()`, `create-error` | `NewIssueForm.vue` | A refused write keeps the title — spec "step 2" green |
| 3 | `isPending` disables the button | `NewIssueForm.vue` | Spec "step 3" green |
| 4 | `useDeleteIssue()` with a `mutationKey`, `saving` with `useIsMutating` | `queries/issues.ts`, `IssueList.vue`, `App.vue` | `npm test` all green |

## Steps

### 1. A mutation that invalidates — `queries/issues.ts`, `NewIssueForm.vue`

1. In `src/queries/issues.ts`, write the composable:

   ```ts
   export function useCreateIssue() {
     const queryClient = useQueryClient();

     return useMutation({
       mutationFn: createIssue,
       onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
     });
   }
   ```

   - `useQueryClient()` is called **during setup**, like every composable: it
     `inject`s the client. Inside `onSuccess` there is no component to inject
     from any more.
   - The arrow **returns** the promise: the mutation stays `pending` until the
     lists are refetched — the button stays disabled until the new row is on
     screen.
   - One invalidation of the root key: every list, and the counter in the
     header, which the form knows nothing about.
2. In `NewIssueForm.vue`, replace `submit`'s body with
   `const { mutate: create } = useCreateIssue()` and
   `create({ title: title.value })`.

**Check it**: create an issue. The Network panel shows the `POST`, then a
`GET /issues?status=open` — **one**, for the two components. The counter says 29.

→ **Done when** the spec "step 1 — a mutation that invalidates" is green.

### 2. The callbacks of `mutate()` — `NewIssueForm.vue`

Clear the input **once the server accepted the issue**, and only then:

```ts
create(
  { title: title.value },
  { onSuccess: () => { title.value = ''; } },
);
```

The callbacks of `mutate()` run **after** those of `useMutation`, and only if
the component is still mounted: the place for what concerns this screen. The
cache logic stays in the composable, where it runs whatever happens to the
component.

Then show `error.message` in `create-error` (`error` is a ref returned by the
mutation; it is reset as soon as the next `mutate()` starts).

**Check it**: tick **The server refuses every write**, create an issue: the
title stays, "The issue tracker refused the change" shows. Untick, submit
again: the error goes, the input empties.

→ **Done when** the spec "step 2 — the callbacks of mutate()" is green.

### 3. The state of a mutation — `NewIssueForm.vue`

`:disabled="isPending"` on `create-submit`. No `submitting` ref to set and
reset in a `finally`: the mutation knows.

**Check it**: latency at 3000 ms: the button stays disabled until the new row
is on screen — the `POST` **and** the refetch, since `onSuccess` returns the
invalidation.

→ **Done when** the spec "step 3 — the state of a mutation" is green.

### 4. Every mutation in flight, from anywhere — `queries/issues.ts`, `IssueList.vue`, `App.vue`

1. Uncomment `issueMutationKeys`, and write `useDeleteIssue()`: the same
   shape, around `(id: number) => deleteIssue(id)`, with
   `mutationKey: issueMutationKeys.delete()`. Give `useCreateIssue` its
   `mutationKey` too.
2. In `IssueList.vue`, use it: `remove(issue.id)` on click, and disable the row
   being deleted (`isPending && variables === issue.id`).
3. In `App.vue`, `const saving = useIsMutating()` — a `Ref<number>` of every
   mutation in flight — and show `saving` while it is above 0. The header holds
   no reference to the form or the list: it reads the **mutation cache**.
   `useIsMutating({ mutationKey: issueMutationKeys.delete() })` would count the
   deletes only.

**Check it**: latency at 1500 ms, delete an issue: "Saving…" in the header,
then the row leaves and the counter drops. The devtools' **Mutations** tab
lists it, with its key.

→ **Done when** `npm test` is all green.

### 5. *(Bonus)* Use the server's answer

`createIssue` answers the new issue: skip the refetch of the open list and
write it in with `queryClient.setQueryData(issueKeys.list('open'), (issues) =>
issues && [...issues, issue])` in `onSuccess`. What about the `all` list, and
the counter? When is invalidating simply safer?

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

- [ ] Creating an issue shows it in the list and updates the counter
- [ ] A refused creation keeps the title and shows why
- [ ] The button is disabled until the new row is on screen
- [ ] Deleting an issue removes its row, and "Saving…" shows meanwhile
- [ ] No component imports `createIssue` or `deleteIssue`: only `src/queries/issues.ts`

**You can explain**

- [ ] Why `onSuccess` returns the invalidation, and what changes if it does not
- [ ] Which callbacks go in `useMutation`, which in `mutate()` — and what
      happens to the latter when the component unmounts
- [ ] Why the header can show "Saving…" without knowing the form or the list
- [ ] `mutate` vs `mutateAsync`

## Going further

- `useMutationState({ filters: { mutationKey: issueMutationKeys.create(), status: 'pending' }, select: (m) => m.state.variables })`
  in the list: the titles being created, from a component that never called
  `mutate()` — that is workshop 05's bonus.
- `queryClient.setMutationDefaults(issueMutationKeys.create(), { … })`: the
  options of a mutation, by key, in `createQueryClient()`.
- A `MutationCache({ onError })` in the client: one toast for every failed
  write, whoever wrote.
