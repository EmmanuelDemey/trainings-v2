# TP 10 — Error boundaries

> This TP is **autonomous**: it does not depend on any other TP. The characters page,
> its filter, its table and its detail card are provided — with three bugs planted on
> purpose. Your job is to write an error boundary, and to make sure none of those bugs
> can blank the page again.

## Goal

Chapter 10 — Contain the failures of a React page:

- **Write an error boundary**: a class component with `getDerivedStateFromError`, a
  `fallback` render prop receiving `error` and `reset`
- **Isolate a widget**: one boundary per independent part of the page, so the rest survives
- **Reset**: by a button (`reset()` + `onReset` to fix the cause), and automatically
  when `resetKeys` change
- **Report**: `componentDidCatch` and an `onError` callback
- **Know the limits**: an error thrown in an **event handler** is never caught by a
  boundary — handle it with `try` / `catch` and state

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Two spec files grade this TP: **`src/components/ErrorBoundary.spec.tsx`** (the
component on its own) and **`src/App.spec.tsx`** (the page and its three bugs). They
are red on the starter — and loudly: without a boundary, the error a component throws
while rendering escapes the test itself. That is exactly what a user would get: a
blank page.

**Already done for you — and broken on purpose:**

- `src/people/PeopleFilter.tsx` — **throws while rendering** when the filter is
  `order 66`. Type it in the browser: the whole page disappears.
- `src/people/PersonCard.tsx` — reads `person.homeworld.name`, and **IG-88** comes
  with `homeworld: null` (`src/data/people.ts`, a corrupted record that lies to the
  types). Select IG-88: blank page again.
- `src/likes.ts` — `likePerson()` **throws for a Sith Lord**. It is called from a click
  handler: like Darth Vader and watch the console.
- `src/components/ErrorBoundary.tsx` — the props are declared (`fallback`, `onReset`,
  `resetKeys`, `onError`); the behaviour is yours to write.

The specs silence `console.error` with `using _consoleError = vi.spyOn(console, 'error')`:
React logs every error a boundary catches, and the spy is restored at the end of the
test's scope — no `afterEach` needed.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The boundary: catch, render the fallback, reset | `src/components/ErrorBoundary.tsx` | The fallback, subtree and `onReset` specs are green |
| 2 | Isolate the filter, and make its reset fix the cause | `src/App.tsx` | "order 66" only kills the filter |
| 3 | `onError`, `resetKeys`, and a boundary around the card | `ErrorBoundary.tsx` + `App.tsx` | Selecting IG-88 then Leia recovers on its own |
| 4 | The error a boundary cannot catch | `src/people/LikeButton.tsx` | Liking Darth Vader shows why, inline |

## Steps

### 1. Write the boundary — `src/components/ErrorBoundary.tsx`

1. Give the class a state `{ error: Error | null }`, starting with `null`, and type it:
   `Component<ErrorBoundaryProps, ErrorBoundaryState>`.
2. Add `static getDerivedStateFromError(error: unknown)`, returning the new state.
   Anything can be thrown in JavaScript (`throw 'oops'`): wrap what is not an `Error`.
3. Add `reset`, as an **arrow function property** (`reset = () => { … }`) so it keeps its
   `this` when passed around: call `this.props.onReset?.()`, then clear the error.
4. In `render`, return `this.props.fallback({ error, reset: this.reset })` while there is
   an error, the children otherwise.

→ **Done when** the `ErrorBoundary` specs about the fallback, the subtree and `onReset`
are green.

### 2. Isolate the filter — `src/App.tsx`

1. Wrap `<PeopleFilter>` — and **only** it — in an `<ErrorBoundary>`. The fallback is a
   `role="alert"` saying `The filter crashed: {error.message}`, with a **Reset the filter**
   button calling `reset`.
2. Type `order 66`, click Reset… and it crashes again: the filter state still holds
   `order 66`. Pass `onReset={() => setFilter('')}` to fix the cause before re-rendering.

→ **Done when** typing `order 66` replaces the filter with the fallback while the title
and the table stay, and Reset brings back an empty filter.

### 3. Report, and reset by key — `ErrorBoundary.tsx` + `App.tsx`

1. Add `componentDidCatch(error, info)` and call `this.props.onError?.(error, info)`.
   Why here and not in `getDerivedStateFromError`? One runs while React renders, the
   other once the fallback is committed: side effects belong to the second.
2. Add `componentDidUpdate(previousProps)`: when an error is displayed and one of the
   `resetKeys` changed (`Object.is`, value by value, plus the length), clear the error.
3. In `App`, wrap `<PersonCard>` in a boundary with `resetKeys={[selected.id]}` and a
   fallback `<p role="alert">This character cannot be displayed.</p>`. No button needed:
   selecting another character **is** the reset.

→ **Done when** `ErrorBoundary.spec.tsx` is fully green, and selecting IG-88 then Leia
Organa shows Leia's card without any click on a Retry button.

### 4. Errors a boundary never sees — `src/people/LikeButton.tsx`

1. Like Darth Vader with the starter code: the console shows an uncaught error, the
   count does not move, and **no boundary would change that**. Boundaries catch errors
   thrown while React renders; a click handler runs later, outside of it — as do
   `setTimeout` callbacks and promise rejections.
2. Wrap the call in `try` / `catch`, keep the message in a `useState`, and render it in a
   `<span role="alert">` next to the button. Clear it after a successful like.

→ **Done when** `App.spec.tsx` is green: liking Darth Vader shows *You cannot like a Sith
Lord* in his row, the count stays at 0, and the page keeps working.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0, with no *Unhandled Errors* section
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `order 66` replaces the filter with a fallback; the title and the table stay
- [ ] Reset brings back an **empty** filter — it does not crash again
- [ ] Selecting IG-88 shows a fallback in the details panel only; selecting another
      character recovers without any click on a Retry button
- [ ] Liking Darth Vader shows the reason inline; liking Luke still counts

**You can explain**

- [ ] Why an error boundary must still be a class component in React 19
- [ ] The difference between `getDerivedStateFromError` and `componentDidCatch`
- [ ] Why a reset that does not fix the cause loops back to the fallback
- [ ] Which errors a boundary does **not** catch, and what to do about each one
- [ ] Where you would put boundaries in a real application — and why "one around
      `<App>`" is not enough

## Going further

- Replace your class with [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary)
  (`npm i react-error-boundary`): its `ErrorBoundary` takes the same `FallbackComponent`,
  `onReset`, `resetKeys` and `onError` props. Your specs should stay green.
- Its `useErrorBoundary()` hook gives an event handler a `showBoundary(error)`: rewrite
  step 4 so that a failed like is shown by a boundary instead of local state. When is
  that the better choice?
- React 19 adds `onCaughtError` and `onUncaughtError` to `createRoot(…, options)`:
  send every error to one reporting function in `src/main.tsx`, and check which ones
  each callback receives.
- Throw from inside a `useEffect` and from a rejected promise. Which one does the
  boundary catch?
