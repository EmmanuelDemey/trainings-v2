# TP 5 — Anatomy of a team composable library

> This TP is **autonomous**: it does not depend on any other TP. The dashboard
> works — badly, in the three ways a copy-pasted composable always works badly.
> You will extract two of them into a shared library, and deliberately leave the
> third where it is.

## Goal

Chapter 5 — Turn "everyone has their own version" into "one place where the
answer lives":

- **Convention 1** — reactive inputs as `MaybeRefOrGetter`, unwrapped with
  `toValue`; one optional options object, always last; defaults resolved once
- **Convention 2** — an **object of refs** out, never a `reactive()`, with the
  return type **exported by name** and `Readonly` on what the caller must not write
- **Convention 3** — **own your effects**: `onScopeDispose`, not `onUnmounted`
- And the decision that comes before all three: **what goes in, what stays out**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Two spec files, both given, both **red**:

- `tests/library.spec.ts` — the library's own contract. It runs the composables
  inside a bare `effectScope()`, **not** inside a component: that is the case
  convention 3 is about, and the one `onUnmounted` silently fails.
- `tests/dashboard.spec.ts` — the three panels, driven the way a user drives
  them. A library is only worth the migration if the app gets visibly better.

## What you are handed

```
src/packages/acme/     the shared library — interfaces given, bodies to write
src/composables/       three app-local composables, the company's Nth copy
src/components/        three consumers that destructure, like every consumer does
```

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Write the debounce composable to the three conventions | `src/packages/acme/useDebounced.ts` | It follows a value, a `ref` **and** a getter, and dies with its scope |
| 2 | Write the polling composable, idempotent and re-schedulable | `src/packages/acme/usePolling.ts` | `start()` twice does not stack two intervals |
| 3 | Migrate the two consumers and delete their local copies | `SearchPanel.vue`, `FleetPanel.vue` | A burst of keystrokes is **one** search call |
| 4 | Fix the one composable that must **not** move | `src/composables/useSortedRows.ts` | The table still updates after the consumer destructures it |

Step 4 is the one people skip: its point is the decision, not the code. Nothing
moves to the library just because it could.

## Steps

### 1. `useDebounced` — `src/packages/acme/useDebounced.ts`

1. Unwrap `source` with `toValue()` and `watch` it. The signature promises
   `MaybeRefOrGetter`; honour it for a plain value, a `ref` **and** a getter.
2. Resolve `delay` once, at the top, default `300`. Never re-read the option
   inside the watcher.
3. Cancel the pending timer on every change, then schedule a new one. `pending`
   is true in between; `flush()` publishes now; `cancel()` drops the wait.
4. `onScopeDispose(cancel, true)` — the pending timer must not outlive the scope.

→ **Done when** it follows a plain value, a `ref` and a getter, `{ delay: 1000 }`
is honoured, and disposing a bare `effectScope()` cancels the pending timer.

### 2. `usePolling` — `src/packages/acme/usePolling.ts`

1. Schedule `task`, count the ticks, flip `isActive`. `start()` on an active poll
   is a **no-op**: stacking two intervals is how a dashboard ends up hammering
   its backend after three navigations.
2. `interval` is a `MaybeRefOrGetter`: `watch` its `toValue()` and re-schedule
   when it changes, without losing the tick count.
3. `onScopeDispose(stop)` rather than `onUnmounted`.
4. No scope at all? Nobody will ever clean up. Detect it with `getCurrentScope()`
   and `console.warn` that the caller has to `stop()` by hand.

> Test it the way the specs do: inside `effectScope()`. `onUnmounted` never fires
> there — which is exactly why a composable built on it cannot be called from a
> Pinia store.

→ **Done when** `start()` twice does not stack two intervals, a reactive
`interval` re-schedules without losing the tick count, and calling it outside any
scope warns.

### 3. Migrate the two consumers — `SearchPanel.vue`, `FleetPanel.vue`

1. `SearchPanel.vue` — use `useDebounced(query)`, delete
   `src/composables/useSearchDebounce.ts`.
2. `FleetPanel.vue` — use `usePolling`, passing the panel's `intervalMs` **ref**
   as the `interval` option, and delete `src/composables/useAutoRefresh.ts`.
3. *(Bonus)* Wire `pending` into the search panel, and `isActive` / `start` /
   `stop` into a pause button.

**Check it**: `apiCalls.search` goes from one-per-keystroke to one-per-burst, and
changing the interval takes effect without a reload.

→ **Done when** `src/composables/useSearchDebounce.ts` and `useAutoRefresh.ts`
are deleted and the two panels still behave.

### 4. Decide what does **not** go in — `src/composables/useSortedRows.ts`

It knows what a `Vehicle` is. The next app will sort something else. It stays in
`src/composables/`, and you fix it where it is:

- it returns a `reactive()`, so `const { sorted } = useSortedRows(...)` hands the
  caller a plain array and the table stops updating
- return an **object of refs** instead, with the return type exported and
  `Readonly` on `sortKey` and `sorted`

> Promotion rule the team agreed on: something moves to the library on its
> **third** real usage, with a named owner per folder — and anything VueUse
> already does well is not our plumbing to reinvent.

→ **Done when** the fleet table re-sorts with the consumer still destructuring,
and you can say why this one stayed out of the library.

### 5. *(Bonus)* Call the library from outside a component

In `main.ts`, call `usePolling` at module scope — no component, no scope. Read
the warning, then wrap it in `effectScope()` and watch it disappear.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the nineteen specs
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] `src/composables/useSearchDebounce.ts` and `useAutoRefresh.ts` are **gone**

**The library holds its contract**

- [ ] `useDebounced` accepts a value, a `ref` and a getter, and follows all three
- [ ] Its `delay` default is resolved once, and `{ delay: 1000 }` is honoured
- [ ] `flush()` and `cancel()` do what their names say
- [ ] `usePolling` re-schedules when a reactive `interval` changes
- [ ] `start()` twice does not stack two intervals
- [ ] Both stop themselves when a bare `effectScope()` is disposed — not only on unmount
- [ ] `usePolling` outside any scope warns, naming `stop()`
- [ ] Both return types are exported by name, and `Readonly` refs are refused by
      the compiler when you try to write them

**The app got better**

- [ ] A burst of keystrokes is **one** search call
- [ ] Changing the refresh interval takes effect immediately
- [ ] The fleet table re-sorts, with the consumer still destructuring

**You can explain**

- [ ] Why `useSortedRows` stays out of the library
- [ ] What `onScopeDispose` covers that `onUnmounted` does not, and where it matters
- [ ] Why the return value is an object of refs and never a `reactive()`
- [ ] Why the options object is last, and always optional

## Going further

- Add `maxWait` to `useDebounced` — publish at least every N ms under a
  continuous stream. Is that still a minor version?
- Replace your `useDebounced` with VueUse's `refDebounced` and compare the
  signatures. What did they decide differently, and why?
- Write the library's `README.md`: the promotion rule, the owner per folder, and
  the three conventions. It is the part that actually makes a library adopted.
- Turn `src/packages/acme` into a real workspace package with its own
  `package.json`, and see what breaks in `vite.config.ts` and `tsconfig.json`.
