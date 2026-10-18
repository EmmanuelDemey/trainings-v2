# TP 19 — Global state with Zustand

> This TP is **autonomous**: it does not depend on any other TP. The people
> table, the like buttons and the header counter are provided; your job is to
> write the Zustand store behind them, subscribe to it the right way, and make it
> survive a reload.

## Goal

Chapter 19 — Replace hand-made shared state with a Zustand store:

- **A store** created with `create<State>()(…)`: data and actions side by side, no Provider
- **Immutable updates** with `set`, and the "nothing changed" case that notifies nobody
- **Selectors**, so a like re-renders one row instead of the whole table
- **The `persist` middleware**: the likes come back after a reload
- **Testing a store** outside React (`getState`, `setState`, `subscribe`) and through components

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 8 (hooks) and chapter 12 (Context): you know why prop drilling and a
  single big Context re-render too much

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Three spec files grade this TP, and they are red on the starter:

- **`src/store/likes.spec.ts`** — the store used **without React**: the actions,
  the selectors, and persistence (a "reload" re-imports the module and expects
  the likes back).
- **`src/components/LikeButton.spec.tsx`** — re-renders, measured with React's
  `<Profiler>`: liking Luke must not re-render Leia's button.
- **`src/App.spec.tsx`** — the whole app, clicked through with `user-event`.

Keep `npm run test:watch` open in a second terminal and turn them green one
step at a time.

**Already done for you:**

- `src/data/people.ts` + `src/model/person.ts` — six Star Wars people.
- `src/components/PeopleTable.tsx` — the table, one `LikeButton` per row.
- `src/components/LikeButton.tsx`, `LikesCounter.tsx`, `ResetLikesButton.tsx` —
  working components that already read the store… the naive way, by
  destructuring the **whole** state. They are correct, and too slow: step 3.
- `src/App.tsx` — the counter and the reset button live in the header, the
  table below: three siblings sharing state, without a single prop passed
  between them.
- The specs reset the store before each test — read their `beforeEach`, you
  will need the same line in every store test you write.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Write the actions `like`, `unlike`, `reset` | `src/store/likes.ts` | The "used outside React" block of `likes.spec.ts` is green |
| 2 | Write the selectors `selectIsLiked(id)` and `selectLikeCount` | `src/store/likes.ts` | The "selectors" block is green, and so is `App.spec.tsx` |
| 3 | Subscribe through selectors in the three components | `src/components/*.tsx` | `LikeButton.spec.tsx` is green: a like re-renders one row |
| 4 | Persist the likes with the `persist` middleware | `src/store/likes.ts` | Like someone, reload: the heart is still filled |

## Steps

### 1. The actions — `src/store/likes.ts`

The store is already created, with its `LikesState` type and an empty
`likedIds` array. The three actions do nothing yet.

1. **TODO 1.1** — `like(id)`: add `id` with
   `set((state) => ({ likedIds: [...state.likedIds, id] }))`. `set` **merges** the
   object you return into the state (one level deep), so the actions stay.
2. Liking someone already liked must change nothing. Return `state` itself in
   that case: Zustand compares with `Object.is`, sees the same object, and
   notifies **no** subscriber. The spec checks it with `useLikes.subscribe`.
3. **TODO 1.2** — `unlike(id)`: `filter` it out. Never `splice` or `push` on
   `state.likedIds`: a mutated array is the same array, and nothing re-renders.
4. **TODO 1.3** — `reset()`: `set({ likedIds: [] })` — no callback needed when
   the new state does not depend on the old one.

→ **Done when** the first `describe` of `likes.spec.ts` is green. Notice you
never rendered anything: `useLikes.getState().like('1')` is a plain function
call.

### 2. The selectors — `src/store/likes.ts`

A selector is a function `(state) => what you need`. Defined next to the store,
it is named, reused, and testable without React.

1. **TODO 2.1** — `selectIsLiked(id)` returns a selector: `(state) =>
   state.likedIds.includes(id)`. It is a *selector factory*, because the id varies
   per row.
2. **TODO 2.2** — `selectLikeCount` returns `state.likedIds.length`.

→ **Done when** the "selectors" block is green — and `App.spec.tsx` too: the
components already work, since they read the whole store.

### 3. Subscribe to what you render — `src/components/*.tsx`

Open the app and add `console.count(person.name)` in `LikeButton`: one click,
**six** logs. `const { likedIds, like, unlike } = useLikes()` subscribes to
everything, so every change re-renders every button.

1. **TODO 3.1** — in `LikeButton`, replace the destructuring with
   `const liked = useLikes(selectIsLiked(person.id))`, plus one selector per
   action: `useLikes((state) => state.like)`. Actions never change, so selecting
   them costs nothing.
2. **TODO 3.2** — in `LikesCounter`, `useLikes(selectLikeCount)`.
3. **TODO 3.3** — in `ResetLikesButton`, select `reset` and a **boolean**:
   `useLikes((state) => selectLikeCount(state) === 0)`. A boolean only changes
   twice in the lifetime of the page.
4. Do not return a new object or array from a selector
   (`useLikes((s) => ({ like: s.like, unlike: s.unlike }))`): a new reference on
   every call means "changed" every time — at best wasted renders, at worst an
   infinite loop. If you really need several fields at once, wrap the selector
   in `useShallow` from `zustand/react/shallow`.

→ **Done when** `LikeButton.spec.tsx` is green, and your `console.count` logs
**once** per click. Remove it.

### 4. Survive a reload — `src/store/likes.ts`

1. **TODO 4.1** — wrap the initializer:
   `create<LikesState>()(persist((set) => ({ … }), { name: 'star-wars-likes' }))`,
   importing `persist` (and `createJSONStorage`) from `zustand/middleware`. Keep
   the curried `create<LikesState>()(…)`: it is what lets TypeScript infer the
   middleware's types.
2. Add `storage: createJSONStorage(() => localStorage)` — the default, but
   writing it shows where the data goes, and is the line you change for
   `sessionStorage`.
3. Add `partialize: (state) => ({ likedIds: state.likedIds })`: persist the
   **data**, never the actions, nor anything transient you add later.
4. Add `version: 1`. The day `likedIds` changes shape, you bump it and write a
   `migrate` instead of crashing on old data.

**Check it**: like two people, reload the page — the hearts are still filled.
Open DevTools → Application → Local storage and read the `star-wars-likes` entry.

→ **Done when** the "persistence" block is green and the likes survive a reload.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — store, selectors, persistence, re-renders, app
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Liking a person fills the heart and increments the counter in the header
- [ ] Clicking a filled heart unlikes; "Reset likes" clears everything and disables itself
- [ ] A like re-renders **one** `LikeButton`, not the six of them
- [ ] The likes survive a reload, stored under `star-wars-likes` with only `likedIds` in it

**You can explain**

- [ ] Why the three components share state without a Provider, and what that costs in tests
- [ ] What `set` merges, and why returning the same `state` object is a free no-op
- [ ] Why a selector returning `{ like, unlike }` re-renders on every change, and what `useShallow` does about it
- [ ] Why each test starts with `useLikes.setState(useLikes.getInitialState(), true)` — and what the `true` means

## Going further

- Add a `filter` string to the store, used by a search box above the table, and
  check that it is **not** persisted (`partialize`). Is a filter global state at
  all, or should it live in the URL?
- Move the reset into a shared test helper: the Zustand docs show a
  `__mocks__/zustand.ts` that resets every store after each test. Compare it
  with the explicit `beforeEach`.
- Add the `devtools` middleware (`devtools(persist(…))`) and watch the actions
  in the Redux DevTools extension. Name them with the third argument of `set`.
- Write the same feature with the Context + `useReducer` of chapter 12, and
  count the re-renders with `<Profiler>`. Which one needs `useMemo` to keep up?
- Add a `persist` `migrate` from a version 0 that stored `{ likes: Record<string, boolean> }`.
