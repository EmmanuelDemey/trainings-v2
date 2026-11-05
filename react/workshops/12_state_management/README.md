# TP 12 — Sharing state: Context, then Redux Toolkit

> This TP is **autonomous**: it does not depend on any other TP. It has two parts.
> **Part 1** — a characters page with a filter and favorites is provided and working,
> through prop drilling: move its shared state into two contexts, without changing
> what the user sees. **Part 2** — the same favorites in a **Redux Toolkit** store,
> with a middleware of your own that persists them and a **saga** that runs a
> debounced, cancellable search.

## Goal

Chapter 12 — Share state between distant components:

- **See prop drilling**: components receiving props only to pass them on
- **Context + Provider**: `createContext`, React 19's `<Context value>`, and a `useX()` hook
  that throws outside its provider
- **`useReducer`** behind a context: a pure, typed, tested reducer
- **Split contexts**: the filter and the favorites change at different rates, and a
  consumer of one must not re-render for the other
- **Refactor safely**: behaviour specs green before, during and after
- **Redux Toolkit**: `createSlice` with Immer, `configureStore`, typed hooks, selectors
- **A middleware** written by hand (`store => next => action`), to persist the favorites
- **Redux-Saga**: `takeLatest`, `delay`, `call`, `put`, cancellation
- **Redux DevTools**: actions, state diff and time travel

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

Part 1 is graded by four spec files:

- **`src/App.spec.tsx`** — what the user sees: filtering, starring, counting, clearing.
  It is **green on the starter**, and must stay green at every step: it is the safety
  net of a refactoring.
- **`src/context/FilterContext.spec.tsx`**, **`src/context/favoritesReducer.spec.ts`**
  and **`src/context/FavoritesContext.spec.tsx`** — the new building blocks, red on the
  starter. The last one renders a `<Profiler>` around a favorites consumer and types in
  the filter: it checks that the counter rendered **once**.

Part 2 by four more, in `src/redux/`, all red on the starter:

- **`favoritesSlice.spec.ts`** — the slice's reducers and selectors, without React
- **`ReduxFavoriteButton.spec.tsx`** and **`ReduxSearchPage.spec.tsx`** — the components
  through a `<Provider store>`; a `<Profiler>` checks that starring Luke does not
  re-render Leia's button
- **`persistMiddleware.spec.ts`** — the middleware, against an in-memory storage
- **`searchSaga.spec.ts`** — the saga, with fake timers and a fake API injected into
  the store: debounce, cancellation of a stale request, errors

`npm run dev` shows part 1 at `http://localhost:5173/`, part 2 at
`http://localhost:5173/#redux` (reload after changing the hash).

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
- For part 2: the search slice (`src/redux/searchSlice.ts`), the page
  (`ReduxSearchPage.tsx`), an in-memory API (`api.ts`), and the skeleton of the store.
  `makeStore` is a **function** taking its dependencies (`api`, `storage`): every spec
  builds a fresh store with its own fakes.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `FilterContext`, `FilterProvider`, `useFilter` | `src/context/FilterContext.tsx` | `FilterContext.spec.tsx` is green |
| 2 | Remove the filter's prop drilling | `App.tsx` + `src/people/` | No component passes `filter` on |
| 3 | The favorites reducer | `src/context/favoritesReducer.ts` | `favoritesReducer.spec.ts` is green |
| 4 | `FavoritesProvider` with `useReducer`, and `useFavorites` | `src/context/FavoritesContext.tsx` | `FavoritesContext.spec.tsx` is green |
| 5 | Remove the favorites' prop drilling | `App.tsx`, `Header.tsx`, `src/people/` | `App` holds no state at all |
| 6 | The favorites slice and its selectors | `src/redux/favoritesSlice.ts` | `favoritesSlice.spec.ts` is green |
| 7 | Read and dispatch from a component | `src/redux/ReduxFavoriteButton.tsx` | `ReduxFavoriteButton.spec.tsx` is green |
| 8 | A persistence middleware | `src/redux/persistMiddleware.ts`, `store.ts` | `persistMiddleware.spec.ts` is green |
| 9 | A debounced, cancellable search saga | `src/redux/searchSaga.ts`, `store.ts` | `searchSaga.spec.ts` and `ReduxSearchPage.spec.tsx` are green |
| 10 | Debug with the Redux DevTools | the browser | You replayed a session with time travel |

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

## Part 2 — Redux Toolkit

### 6. The slice — `src/redux/favoritesSlice.ts`

1. `toggled`: add the id when it is missing, remove it otherwise. Write it with
   `push` and `splice`: `createSlice` runs the reducer on an **Immer draft**, and the
   "mutations" produce a new, frozen state. The spec freezes the state it passes in to
   prove nothing is mutated.
2. `cleared`: `state.ids = []`.
3. The three selectors take the **root** state (`{ favorites }`), not the slice. Note
   that `toggled('1')` produces `{ type: 'favorites/toggled', payload: '1' }`: the
   slice's name prefixes every action type.

→ **Done when** `favoritesSlice.spec.ts` is green.

### 7. A component on the store — `src/redux/ReduxFavoriteButton.tsx`

1. `useAppSelector` and `useAppDispatch` are already typed with `.withTypes<…>()` in
   `store.ts`: read them, no component ever writes `RootState` by hand.
2. The starter selects the **whole** slice. `useSelector` re-renders when the selected
   value changes (`===`): a new `favorites` object on every toggle, so every button
   re-renders. Select `selectIsFavorite(state, person.id)` instead — a boolean.
3. Dispatch `toggled(person.id)` on click.

→ **Done when** `ReduxFavoriteButton.spec.tsx` is green — including the `<Profiler>`
spec: starring Luke renders Leia's button **once** (its mount).

### 8. A middleware — `src/redux/persistMiddleware.ts`

A middleware is three nested functions: `store => next => action => …`. Every
`dispatch` goes through it **before** the reducers.

1. Call `next(action)` **first**: when it returns, the reducers have run, and
   `store.getState()` holds the new favorites. Write them under `FAVORITES_KEY`.
2. Only for `toggled` and `cleared`: `isAnyOf(toggled, cleared)` is a type guard built
   from the action creators. A search must not write anything.
3. Always return what `next` returned — another middleware may rely on it.
4. `loadFavorites` reads the key back, and returns `[]` for anything that is not an
   array of strings (missing key, invalid JSON, hand-edited value).
5. In `makeStore`: `preloadedState` from `loadFavorites(storage)`, and
   `getDefaultMiddleware().concat(createPersistMiddleware(storage))`. Keep the defaults:
   they bring the thunk middleware and the dev-mode checks that catch a mutation or a
   non-serialisable value in the state.

→ **Done when** `persistMiddleware.spec.ts` is green. In the browser, star someone at
`/#redux`, reload: the star is still there.

### 9. A saga — `src/redux/searchSaga.ts`

The search slice only holds plain actions. Something has to react to
`searchRequested`, wait, call the API and dispatch the result: a **saga**, a generator
the saga middleware runs. Each `yield` hands an **effect** (a plain object) to the
middleware, which executes it.

1. `search(api, action)`: `yield delay(SEARCH_DEBOUNCE_MS)`, then
   `yield call(api.searchPeople, action.payload, controller.signal)`, then
   `yield put(searchSucceeded(results))`. On error, `put(searchFailed(message))`.
2. `rootSaga`: `yield takeLatest(searchRequested.type, search, api)`. `takeLatest`
   **cancels** the running task when a new query comes in. Cancelled during `delay`,
   that is a debounce. Cancelled during `call`, its result is never `put` — the race
   condition of chapter 9, solved by the library.
3. In the `finally`, `if (yield cancelled()) controller.abort()`: the HTTP request is
   aborted too, not just ignored.
4. In `makeStore`: `createSagaMiddleware()`, added to the `concat`, and
   `sagaMiddleware.run(rootSaga, api)` **after** `configureStore`.

→ **Done when** `searchSaga.spec.ts` and `ReduxSearchPage.spec.tsx` are green. The
saga spec injects a fake `api` into the store and drives the clock with
`vi.advanceTimersByTimeAsync`: read it, it is the way to test a saga end to end.

### 10. The Redux DevTools

Install the **Redux DevTools** browser extension. `configureStore` connects to it in
development, no code needed.

1. Open `/#redux`, type a search, star two people.
2. In the **Redux** panel: the action list (`search/searchRequested`,
   `search/searchSucceeded`, `favorites/toggled`…), the **Diff** tab for each one, the
   **State** tab.
3. Drag the slider (time travel): the UI goes back to the state of each action.
4. Note the cancelled searches: several `searchRequested`, a single `searchSucceeded`.

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
- [ ] At `/#redux`, the favorites survive a reload, and a fast typist triggers a single search

**You can explain**

- [ ] When a context is the right tool — and when passing a prop two levels down is simpler
- [ ] Why the provider's `value` is memoised, and what happens to the consumers if it is not
- [ ] Why the filter and the favorites live in two contexts and not one
- [ ] What a reducer buys you over a few `useState` setters
- [ ] Why `next(action)` comes before `store.getState()` in the middleware
- [ ] What `takeLatest` does to a task that is waiting in `delay`, or in `call`
- [ ] When you would pick a thunk, the listener middleware, a saga — or TanStack Query

## Going further

- **Split state and actions**: provide `toggle` / `clear` in a second
  `FavoritesActionsContext`. A component that only toggles (the button) no longer
  re-renders when the list changes. Prove it with a `<Profiler>` spec.
- **Persist** the favorites: initialise the reducer from `localStorage` (the third
  argument of `useReducer`), and write them back in an effect.
- **The listener middleware**: rewrite the persistence with Redux Toolkit's
  `createListenerMiddleware` (`startListening({ matcher: isAnyOf(toggled, cleared), effect })`).
  Then rewrite the search with it too: `listenerApi.cancelActiveListeners()` and
  `listenerApi.delay()` give `takeLatest` + `delay`, without generators.
- **`redux-persist`**: replace your middleware with the library (`persistReducer`,
  `persistStore`, `<PersistGate>`). What does it do that yours does not (versions,
  migrations, rehydration actions)? Mind the serializability check: it needs
  `ignoredActions`.
- **A unit test of the saga**: step through `search(api, action)` with `.next()` and
  compare each yielded effect with `call(...)` / `put(...)`. Compare with the
  end-to-end spec: which one breaks on a harmless refactor?
- **RTK Query**: replace the search slice and the saga with `createApi` and
  `useSearchPeopleQuery(query)`.
- Chapter 19 does the same with **Zustand**, in a dozen lines and without a provider.
