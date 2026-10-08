# TP 04 — Mutations and callbacks

> The tracker reads well; now it writes. A form creates issues, each row can be
> deleted — and nobody else on the page hears about it. Route every write
> through TanStack Query, and let the cache keep every screen honest.

## Goal

Chapter 04 — Writing server data:

- **`injectMutation`** wrapped in your own **inject functions**, `injectCreateIssue()`
  and `injectDeleteIssue()`
- **Invalidation** in `onSuccess`, **returned**, so the button waits for the refetch
- **The callbacks of `mutate()`** for what only the form cares about
- **`injectIsMutating`**: a "Saving…" in the header, for any write, from anywhere

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 04 of the deck

## Setup

```bash
npm install
npm run dev          # http://localhost:4200
npm test             # ng test --watch=false — red on the starter
npm run test:watch
npm run typecheck
```

The spec is **`src/tests/shared/workshop.spec.ts`**; `src/api/` and
`src/tests/shared/` are shared copies: do not edit them. The queries are done
(workshop 01's solution, with `staleTime: 30_000`): only the writes are left.

**The bugs you are about to fix**, all visible as shipped:

- Create an issue: it never shows up, and the header counter keeps lying — the
  cached lists are fresh for 30 seconds, and nothing tells them otherwise.
- Tick **The server refuses every write** in the Network panel and create an
  issue: no error on screen, and the input is cleared — what you typed is lost.
- Nothing stops a double submit: the button is never disabled.
- Delete an issue: it stays on screen. And the header never says "Saving…".

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `injectCreateIssue()`: a mutation that invalidates | `issues/issue-mutations.ts`, `issues/new-issue-form.ts` | The new issue and the counter show; step 1 green |
| 2 | `mutate(title, { onSuccess })`, and the error | `issues/new-issue-form.ts` | A refused write keeps the input; step 2 green |
| 3 | `isPending()` disables the button | `issues/new-issue-form.ts` | Step 3 green |
| 4 | `injectDeleteIssue()` with a `mutationKey`, and "Saving…" | `issues/issue-mutations.ts`, `issues/issue-list.ts`, `app.ts` | `npm test` — all green |

## Steps

### 1. A mutation that invalidates — `issue-mutations.ts`, `new-issue-form.ts`

1. In `src/app/issues/issue-mutations.ts`, write the mutation keys:
   `issueMutationKeys = { all: ['issues'], create: () => [...all, 'create'], delete: () => [...all, 'delete'] }`.
2. Write `injectCreateIssue()`: `const queryClient = inject(QueryClient);`, then
   return `injectMutation(() => ({ mutationKey: issueMutationKeys.create(), mutationFn: (title: string) => createIssue({ title }), onSuccess: … }))`.
3. `onSuccess` **returns** `queryClient.invalidateQueries({ queryKey: issueKeys.all })`:
   the mutation stays pending until the lists have refetched.
4. In `NewIssueForm`, a field `protected readonly createIssue = injectCreateIssue();`,
   and `submit` calls `this.createIssue.mutate(this.title())`.

An inject function is the Angular custom hook: a plain function that calls
`inject()`. It inherits the rule — call it in a field or a constructor — and the
component no longer knows the API, the keys, nor what to invalidate.

**Check it**: create an issue: it shows in the list, **and** the counter of the
header — a component the form knows nothing about — says 29.

→ **Done when** the step 1 spec is green.

### 2. The callbacks of `mutate()` — `new-issue-form.ts`

1. Clear the input in the callbacks of **this call**:
   `this.createIssue.mutate(this.title(), { onSuccess: () => this.title.set('') })`.
   Nothing clears it on failure.
2. Under the form, `@if (createIssue.isError())`, show
   `<p data-testid="create-error">{{ createIssue.error().message }}</p>`.
   The next `mutate()` resets the error by itself.

Options-level callbacks (in `injectMutation`) always run: the cache work goes
there. `mutate()`-level callbacks are skipped if the component is destroyed in
between: UI work only.

**Check it**: tick **The server refuses every write**, create an issue: the
message shows and the title stays. Untick, submit again: created, input cleared.

→ **Done when** the step 2 spec is green.

### 3. The state of a mutation — `new-issue-form.ts`

1. `[disabled]="createIssue.isPending()"` on `create-submit`.

**Check it**: latency 3000 ms: the button stays disabled until the new issue is
**on screen** — because `onSuccess` returned the invalidation.

→ **Done when** the step 3 spec is green.

### 4. Every mutation in flight — `issue-mutations.ts`, `issue-list.ts`, `app.ts`

1. `injectDeleteIssue()`: the same shape, around `deleteIssue(id)`, with
   `mutationKey: issueMutationKeys.delete()`.
2. In `IssueList`, `protected readonly deleteIssue = injectDeleteIssue();` — one
   mutation for every row — and `(click)="deleteIssue.mutate(issue.id)"`.
   `remove()` goes.
3. In `App`, `protected readonly mutating = injectIsMutating();` — a
   `Signal<number>` of the mutations in flight, anywhere — and
   `@if (mutating() > 0) { <span data-testid="saving">Saving…</span> }`.

**Check it**: latency 3000 ms, delete a row: "Saving…" in the header until the
row is gone. Open the **Mutations** tab of the devtools.

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

- [ ] No component imports `createIssue` or `deleteIssue`: only `issue-mutations.ts` does
- [ ] Creating an issue updates the list and the header counter
- [ ] A refused write shows its message and keeps the input
- [ ] The button is disabled until the new issue is on screen
- [ ] "Saving…" shows in the header during any write

**You can explain**

- [ ] Why `onSuccess` **returns** the invalidation, and what not returning it changes
- [ ] Which callbacks go in `injectMutation`, which in `mutate()`, and why
- [ ] Why `injectCreateIssue()` must be called in a field initializer
- [ ] How the header knows a row is deleting without any input or output

## Going further

- *(Bonus)* Instead of refetching after a creation, write the server's answer
  into the open list: `queryClient.setQueryData(issueKeys.list('open'), (issues) => issues && [...issues, created])`.
  What about the counter, and the "all" list?
- *(Bonus)* `mutationOptions({ mutationKey, mutationFn })`: share the options of
  the creation, and read its pending titles elsewhere with `injectMutationState`.
- Use `mutateAsync` in `submit` instead: what do you have to add, and why is
  `mutate` the better default in a component?
