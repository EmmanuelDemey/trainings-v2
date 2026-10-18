# TP 12 — Sharing state with Context

> This TP is **autonomous**: it does not depend on any other TP. A characters page
> with a filter and favorites is provided and working — through prop drilling. Your
> job is to move its shared state into two contexts, without changing what the user sees.

## Goal

Chapter 12 — Share state between distant components:

- **See prop drilling**: components receiving props only to pass them on
- **Context + Provider**: `createContext`, React 19's `<Context value>`, and a `useX()` hook
  that throws outside its provider
- **`useReducer`** behind a context: a pure, typed, tested reducer
- **Split contexts**: the filter and the favorites change at different rates, and a
  consumer of one must not re-render for the other
- **Refactor safely**: behaviour specs green before, during and after

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

Four spec files grade this TP:

- **`src/App.spec.tsx`** — what the user sees: filtering, starring, counting, clearing.
  It is **green on the starter**, and must stay green at every step: it is the safety
  net of a refactoring.
- **`src/context/FilterContext.spec.tsx`**, **`src/context/favoritesReducer.spec.ts`**
  and **`src/context/FavoritesContext.spec.tsx`** — the new building blocks, red on the
  starter. The last one renders a `<Profiler>` around a favorites consumer and types in
  the filter: it checks that the counter rendered **once**.

**Already done for you:**

- The whole page, in `src/App.tsx`, `src/components/Header.tsx` and `src/people/`. Draw
  its tree before you start:

  ```
  App  ── filter, favorites (useState)
  ├── Header         favorites, onClear
  │   ├── FavoritesCount        count
  │   └── ClearFavoritesButton  disabled, onClear
  └── HomePage       filter, onFilterChange, favorites, onToggleFavorite
      ├── Toolbar    filter, onFilterChange
      │   └── PeopleFilter      value, onChange
      └── PeopleTable           filter, favorites, onToggleFavorite
          └── PersonRow         isFavorite, onToggleFavorite
              └── FavoriteButton  pressed, onToggle
  ```

- The types of the contexts' values and of the reducer's actions, in `src/context/`.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `FilterContext`, `FilterProvider`, `useFilter` | `src/context/FilterContext.tsx` | `FilterContext.spec.tsx` is green |
| 2 | Remove the filter's prop drilling | `App.tsx` + `src/people/` | No component passes `filter` on |
| 3 | The favorites reducer | `src/context/favoritesReducer.ts` | `favoritesReducer.spec.ts` is green |
| 4 | `FavoritesProvider` with `useReducer`, and `useFavorites` | `src/context/FavoritesContext.tsx` | `FavoritesContext.spec.tsx` is green |
| 5 | Remove the favorites' prop drilling | `App.tsx`, `Header.tsx`, `src/people/` | `App` holds no state at all |

## Steps

### 1. The filter context — `src/context/FilterContext.tsx`

1. Create the context with `createContext<FilterContextValue | null>(null)`. Why `null`
   rather than a default `{ filter: '', setFilter: () => {} }`? A consumer rendered
   outside the provider would then silently do nothing.
2. `FilterProvider` owns the `useState('')` and renders
   `<FilterContext value={value}>{children}</FilterContext>` — in React 19 the context
   is its own provider, `.Provider` is no longer needed. Wrap `value` in `useMemo`.
3. `useFilter()` reads the context with `useContext` (or `use`) and throws
   `useFilter must be used inside a <FilterProvider>` when it gets `null`. Its return
   type has no `null` left: every caller is spared the check.

→ **Done when** `FilterContext.spec.tsx` is green.

### 2. No more filter props — `src/App.tsx` + `src/people/`

1. Wrap the content of `App` in `<FilterProvider>` and delete its `filter` state.
2. `PeopleFilter` and `PeopleTable` call `useFilter()`.
3. Remove `filter` / `onFilterChange` from `HomePage` and `Toolbar`: they never used them.

→ **Done when** `App.spec.tsx` is still green and `grep -rn onFilterChange src` finds nothing.

### 3. The reducer — `src/context/favoritesReducer.ts`

1. `switch (action.type)`: `'toggled'` adds the id when missing and removes it otherwise;
   `'cleared'` empties the list.
2. Never mutate `state` (no `push`, no `splice`): return a new array when something
   changes — React compares the old and the new state **by reference**.
3. Clearing an empty list returns the **same** array: React then skips the re-render.

→ **Done when** `favoritesReducer.spec.ts` is green. It needs no React at all: that is
the point of a reducer.

### 4. The favorites context — `src/context/FavoritesContext.tsx`

1. Same shape as step 1, but `FavoritesProvider` holds
   `useReducer(favoritesReducer, [])`.
2. Expose `{ favorites, isFavorite, toggle, clear }`, the last two dispatching an action.
   Memoise it on `[favorites]` — `dispatch` is stable, it never needs to be a dependency.
3. `useFavorites()` throws `useFavorites must be used inside a <FavoritesProvider>`.
4. Keep it a **separate** context. Put the filter and the favorites in one context and
   the last spec of `FavoritesContext.spec.tsx` goes red: every keystroke in the filter
   would re-render every favorites consumer.

→ **Done when** `FavoritesContext.spec.tsx` is green.

### 5. No more favorites props — `App.tsx`, `Header.tsx`, `src/people/`

1. Wrap `App` in `<FavoritesProvider>` and delete its last state.
2. `FavoritesCount`, `ClearFavoritesButton` and `FavoriteButton` call `useFavorites()`.
3. Remove the favorites props from `Header`, `HomePage`, `PeopleTable` and `PersonRow`.
4. Open the React DevTools, enable *Highlight updates when components render*, and type
   in the filter: the header does not flash.

→ **Done when** every spec is green, `App` has no `useState`, and the only props left in
`src/people/` are `person`.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Filtering, starring, counting and clearing work exactly as before the refactoring
- [ ] `App` holds no state; no component receives a prop only to pass it on
- [ ] `useFilter()` / `useFavorites()` outside their provider throw an explicit error
- [ ] Typing in the filter does not re-render the favorites counter

**You can explain**

- [ ] When a context is the right tool — and when passing a prop two levels down is simpler
- [ ] Why the provider's `value` is memoised, and what happens to the consumers if it is not
- [ ] Why the filter and the favorites live in two contexts and not one
- [ ] What a reducer buys you over a few `useState` setters

## Going further

- **Split state and actions**: provide `toggle` / `clear` in a second
  `FavoritesActionsContext`. A component that only toggles (the button) no longer
  re-renders when the list changes. Prove it with a `<Profiler>` spec.
- **Persist** the favorites: initialise the reducer from `localStorage` (the third
  argument of `useReducer`), and write them back in an effect.
- **Redux Toolkit**: `npm i @reduxjs/toolkit react-redux`, write a `favoritesSlice` with
  `createSlice` (its reducers may "mutate" — Immer turns that into a copy), a store with
  `configureStore`, a `<Provider store>`, and `useSelector` / `useDispatch` hooks typed
  with `.withTypes<…>()`. Compare: which re-renders does a selector avoid that the
  context version cannot?
- Chapter 19 does the same with **Zustand**, in a dozen lines and without a provider.
