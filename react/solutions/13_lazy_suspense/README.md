# TP 13 — Lazy loading, Suspense and transitions

> This TP is **autonomous**: it does not depend on any other TP. The people list,
> the fake API (MSW), the error boundary and the statistics page are provided and
> working; your job is to split the bundle, read data with `use()`, and keep the
> screen calm while it loads.

## Goal

Chapter 13 — Make a small app load only what it needs, and wait gracefully:

- **Code splitting** with `React.lazy` and a `<Suspense>` fallback
- **A promise cache**, the one thing `use()` cannot do without
- **`use()`** to read a person's details, suspending while they load
- **An error boundary** around a suspending component, with a working retry
- **`useTransition`** to keep the current person on screen while the next loads

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapters 8 (hooks) and 10 (error boundaries)

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the API answers after ~800 ms
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are already written and red on the starter. Keep
`npm run test:watch` open in a second terminal and turn them green, step by
step:

- **`src/App.spec.tsx`**: the lazy statistics page (step 1)
- **`src/api/people.spec.ts`**: the promise cache (step 2)
- **`src/components/PersonPanel.spec.tsx`**: `use()`, Suspense and the error boundary (steps 3 and 4)
- **`src/pages/PeoplePage.spec.tsx`**: the transition (step 5)

Read the comment at the top of `PersonPanel.spec.tsx`. A component that suspends
on `use()` has to be rendered inside an **awaited** `act(...)`, or React never
retries the render. `src/tests/hold.ts` holds the API's answers back, so a spec
can look at the screen *while* a person is loading.

**Already done for you:**

- `src/mocks/` holds the fake API: `GET /api/people/:id` (404 for an unknown id).
  The browser gets it through a service worker started in `src/main.tsx`. Node
  (the specs) gets it through `setupServer`, started in `src/tests/setup.ts`.
- `src/components/ErrorBoundary.tsx`, the boundary of chapter 10: a `fallback`
  render prop receiving `{ error, reset }`, plus `resetKeys`.
- `src/components/Loader.tsx`: a `role="status"` message.
- `src/components/PeopleList.tsx` and `src/pages/StatsPage.tsx`, the "heavy" page.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Lazy-load the statistics page | `src/App.tsx` | `npm run build` emits a `StatsPage-*.js` chunk |
| 2 | Cache the person promises | `src/api/people.ts` | Two calls for one id give the **same** promise |
| 3 | Read the person with `use()` under `<Suspense>` | `src/components/PersonDetails.tsx` + `PersonPanel.tsx` | "Loading person…", then the details |
| 4 | Contain failures, retry for real | `src/components/PersonPanel.tsx` | A 500 shows an alert, and "Try again" recovers |
| 5 | Switch people inside a transition | `src/pages/PeoplePage.tsx` | The old person stays, dimmed, until the new one is there |

## Steps

### 1. Code splitting — `src/App.tsx`

1. Replace the static `import StatsPage from './pages/StatsPage'` with
   `const StatsPage = lazy(() => import('./pages/StatsPage'))`, **at module
   level**. `lazy` expects a module with a `default` export, which is why
   `StatsPage.tsx` has one.
2. Wrap the pages in `<Suspense fallback={<Loader label="Loading page…" />}>`.

**Check it**: run `npm run build` and look for a separate `StatsPage-*.js` in
`dist/assets`. Then, in `npm run dev`, open the Network tab, clear it, click
"Statistics", and watch the chunk download, once.

→ **Done when** the build emits a separate chunk, the fallback flashes on the
first visit only, and the `App.spec.tsx` specs are green.

### 2. A promise cache — `src/api/people.ts`

A component that suspends is **thrown away**. React renders it again from
scratch once the promise settles. If that render calls `fetchPerson(id)` again,
it gets a *new* pending promise, suspends again, and loops forever. React even
warns about it: "A component was suspended by an uncached promise".

1. Add a module-level `Map<string, Promise<Person>>`. `getPerson(id)` returns the
   cached promise, and creates and stores it on the first call.
2. `forgetPerson(id)` deletes one entry, and `clearPeopleCache()` empties the map.

→ **Done when** the `getPerson` specs are green: one request for three calls,
and a fresh request after `forgetPerson`.

### 3. `use()` under Suspense — `src/components/PersonDetails.tsx` + `PersonPanel.tsx`

1. In `PersonDetails`, call `const person = use(getPerson(id))` and render the
   `<article>` described in the TODO. No `useState`, no `useEffect`, no
   `loading` flag: while the promise is pending, the component simply *does not
   render*.
2. In `PersonPanel`, wrap `<PersonDetails>` in
   `<Suspense fallback={<Loader label="Loading person…" />}>`.

→ **Done when** clicking a name shows "Loading person…" for a moment, then the
details.

### 4. Failures — `src/components/PersonPanel.tsx`

`use()` **throws** a rejected promise's error, so the closest error boundary
catches it.

1. Wrap the `<Suspense>` in `<ErrorBoundary resetKeys={[id]} fallback={…}>`.
   The fallback is a `role="alert"` block with "Could not load this person.",
   the error message and a "Try again" button.
2. "Try again" must call `forgetPerson(id)` **then** `reset()`. Try `reset()`
   alone first: the boundary renders `PersonDetails` again, which gets the
   *cached rejected* promise back, and fails at once.

**Check it**: in `src/mocks/handlers.ts`, temporarily return a 500 for
`params.id === '4'`, then click Darth Vader. The list must keep working.

→ **Done when** the alert shows inside the panel only, and "Try again" really
retries.

### 5. A transition — `src/pages/PeoplePage.tsx`

Pick Luke, then C-3PO: Luke disappears behind "Loading person…" for 800 ms. On a
fast connection, that flash is worse than waiting.

1. `const [isPending, startTransition] = useTransition()`, and
   `startTransition(() => setSelectedId(id))`.
2. Pass `isPending` to `<PersonPanel>`. It sets `aria-busy`, which the CSS dims.

Inside a transition, React does not hide content that is **already on screen**
behind a fallback. It keeps it until the next render is ready. This is why step
4 uses `resetKeys` and not `key={id}`: a remounted `<Suspense>` is *new*, and a
new boundary always shows its fallback.

→ **Done when** switching people keeps the previous one visible and dimmed, then
swaps it in one go, and every spec is green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds and emits a separate `StatsPage-*.js` chunk
- [ ] `grep -rn TODO src` returns nothing
- [ ] No React warning in the browser console while you click around

**The behaviour is there**

- [ ] The statistics chunk downloads the first time the page opens, never before
- [ ] `getPerson('1') === getPerson('1')`
- [ ] Picking a first person shows "Loading person…", then their details
- [ ] A failing person shows an alert in the panel, the list still works, and "Try again" recovers
- [ ] Switching from one person to the next never blanks the panel

**You can explain**

- [ ] Why a `lazy(...)` declared *inside* a component is a bug
- [ ] Why `use(fetchPerson(id))`, without a cache, loops forever
- [ ] Why the retry has to forget the cached promise
- [ ] When `<Suspense>` shows its fallback inside a transition, and when it does not

## Going further

- Wrap the *page* switch in `startTransition` too. What happens to the "Loading
  page…" fallback on the first visit to the statistics page, and why?
- Preload: call `import('./pages/StatsPage')` on `onPointerEnter` of the
  "Statistics" button, so the chunk is often there before the click.
- Use `useDeferredValue` on a filter input over the people list, and compare it
  with `useTransition`. Which of the two lets you keep a controlled input?
- Replace the hand-written cache with TanStack Query's `useSuspenseQuery`
  (chapter 17). What do you get for free: invalidation, retries, garbage
  collection?
