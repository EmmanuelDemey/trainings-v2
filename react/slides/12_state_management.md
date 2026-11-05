---
layout: cover
---

# 12 - State management

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Decide** where a piece of state lives: in a component, lifted to a parent, in a
  context, or in a store
- **Recognise** prop drilling and **remove** it with a context
- **Build** a context the robust way: a typed `createContext`, a Provider component
  with `useReducer`, and a `useX()` hook that throws outside its provider
- **Avoid** needless re-renders by splitting contexts and memoising the value
- **Build** a Redux Toolkit store: `createSlice`, `configureStore`, typed hooks,
  selectors and `createAsyncThunk`
- **Write** a middleware, and **run** async flows with the listener middleware or
  **Redux-Saga** (`takeLatest`, `call`, `put`, cancellation)
- **Debug** with the Redux DevTools and **persist** a slice across reloads

---

# Where does this state live?

<br />

| The state is used by… | Put it… |
|---|---|
| one component | `useState` / `useReducer` **in that component** |
| a few siblings | **lifted** to their closest common parent, passed as props |
| many components, far apart, rarely changing (theme, user, locale) | a **Context** |
| many components, changing often, with complex updates | a **store**: Zustand (ch. 19), Redux Toolkit |
| server data (cache of the API) | **TanStack Query** (ch. 17) or router loaders (ch. 14) |
| the URL (filters, page, selected tab) | **search params** (ch. 14) |

<br />

- Start local, move up **only when a second consumer appears**
- Most "global state" is in fact **server cache** — a store is the wrong tool for it

---

# Lifting state up

```tsx
function PeoplePage() {
  const [filter, setFilter] = useState('');            // the common parent owns it

  return (
    <>
      <PeopleFilter value={filter} onChange={setFilter} />
      <PeopleTable people={people} filter={filter} />
    </>
  );
}
```

- **One source of truth**: both children read the same value
- Data goes **down** through props, events go **up** through callbacks
- Perfect for 2 levels. At 5 levels, it becomes…

---

# … prop drilling

```tsx
<App favorites={favorites} onToggleFavorite={toggle}>
  <Layout favorites={favorites} onToggleFavorite={toggle}>      {/* doesn't care */}
    <PeoplePage favorites={favorites} onToggleFavorite={toggle}> {/* doesn't care */}
      <PeopleTable favorites={favorites} onToggleFavorite={toggle}>
        <PersonRow isFavorite={…} onToggleFavorite={toggle} />  {/* the only real user */}
```

- Intermediate components receive props they **only forward**
- Renaming `onToggleFavorite` touches 5 files
- First try **composition** (pass `children` / elements, chapter 6) — it often removes the
  middle layers
- Otherwise, a **context** lets any descendant read the value directly

---

# The state container idea

<div style="text-align: center;">
  <img
   src="/images/state_container.png"
   alt="A store holds the state; components read from it and dispatch actions to it"
   style="width: 280px; margin: auto; display: flex;"
  />
</div>

- **One** place holds the state and the functions that change it
- Components **read** what they need, **send** intentions (actions)
- Contexts, Redux, Zustand: three implementations of this idea

---

# Context in three steps

```tsx
// 1. create — the default value is used only when there is NO provider above
const ThemeContext = createContext<'light' | 'dark'>('light');

// 2. provide — React 19: render the context itself (no more .Provider)
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  return (
    <ThemeContext value={theme}>
      <Toolbar />
    </ThemeContext>
  );
}

// 3. consume — any descendant, at any depth
function ThemedButton() {
  const theme = useContext(ThemeContext);   // or use(ThemeContext), callable in an if
  return <button className={`btn-${theme}`}>OK</button>;
}
```

- When `value` changes, **every** consumer below re-renders

---

# A context with state **and** actions

```tsx
type Action = { type: 'toggle'; id: string } | { type: 'clear' };

function favoritesReducer(state: string[], action: Action): string[] {
  switch (action.type) {
    case 'toggle':
      return state.includes(action.id) ? state.filter((id) => id !== action.id) : [...state, action.id];
    case 'clear':
      return [];
  }
}
```

- A **reducer** keeps every transition in one pure, testable function
- The union of actions documents what can happen to the state
- Exactly the Redux model — without the library

---

# The Provider component

```tsx {*}{maxHeight:'400px'}
type FavoritesContextValue = {
  favorites: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, []);

  const value = useMemo(
    () => ({
      favorites,
      toggle: (id: string) => dispatch({ type: 'toggle', id }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [favorites],          // a new object only when the favorites change
  );

  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}
```

---

# The `useFavorites` hook

```tsx
export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (context === null) {
    throw new Error('useFavorites must be used within a <FavoritesProvider>');
  }
  return context;          // narrowed: no `| null` for the callers
}
```

```tsx
function PersonRow({ person }: { person: Person }) {
  const { favorites, toggle } = useFavorites();
  const isFavorite = favorites.includes(person.id);
  return (
    <button aria-pressed={isFavorite} onClick={() => toggle(person.id)}>
      {isFavorite ? '★' : '☆'} {person.name}
    </button>
  );
}
```

- Only the provider file knows the context object: export the **Provider** and the **hook**
- A missing provider fails **loudly**, at the first render, with a clear message

---

# Performance: split the contexts

Every consumer re-renders when the context **value** changes — even if it only uses `toggle`.

```tsx
const FavoritesStateContext = createContext<string[] | null>(null);
const FavoritesDispatchContext = createContext<Dispatch<Action> | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, []);
  return (
    <FavoritesStateContext value={favorites}>
      <FavoritesDispatchContext value={dispatch}>  {/* dispatch is stable */}
        {children}
      </FavoritesDispatchContext>
    </FavoritesStateContext>
  );
}
```

- Components that only **dispatch** never re-render on a change
- Split by **concern** too: a `FilterContext` separate from `FavoritesContext`
- Memoise an object value with `useMemo`, or every parent render notifies every consumer

---

# Contexts: the limits

- No **selectors**: a consumer can't subscribe to "just `favorites.length`"
- Fine for values that change **rarely**: theme, locale, current user, feature flags
- Painful for state that changes **often** and is read in many places
- Deeply nested providers ("provider hell") are a smell

<br />

When you hit those limits, use a **store**:

- **Zustand** — tiny, hooks-first, selectors built in (chapter 19)
- **Redux Toolkit** — the long-standing standard, strict one-way data flow, great DevTools

---

# Redux Toolkit — a slice

```shell
npm install @reduxjs/toolkit react-redux
```

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type FavoritesState = { ids: string[] };
const initialState: FavoritesState = { ids: [] };

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggle(state, action: PayloadAction<string>) {
      const index = state.ids.indexOf(action.payload);
      if (index === -1) state.ids.push(action.payload);   // "mutation" — Immer makes it immutable
      else state.ids.splice(index, 1);
    },
    clear(state) { state.ids = []; },
  },
});

export const { toggle, clear } = favoritesSlice.actions;   // generated action creators
```

---

# The store and typed hooks

```ts
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: { favorites: favoritesSlice.reducer, people: peopleSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
```

```tsx
// main.tsx
<Provider store={store}>
  <App />
</Provider>
```

- `configureStore` sets up the DevTools, thunks and dev-mode checks for you

---

# Reading and dispatching

```tsx
function FavoriteButton({ id }: { id: string }) {
  const isFavorite = useAppSelector((state) => state.favorites.ids.includes(id));
  const dispatch = useAppDispatch();

  return (
    <button aria-pressed={isFavorite} onClick={() => dispatch(toggle(id))}>
      {isFavorite ? '★' : '☆'}
    </button>
  );
}
```

- `useSelector` re-renders the component **only** if the selected value changes
  (compared with `===`)
- Return primitives or existing references; a new array/object every time re-renders always

---

# Selectors and `createSelector`

```ts
import { createSelector } from '@reduxjs/toolkit';

const selectPeople = (state: RootState) => state.people.list;
const selectFavoriteIds = (state: RootState) => state.favorites.ids;

// memoised: recomputed only when one of its inputs changes
export const selectFavoritePeople = createSelector(
  [selectPeople, selectFavoriteIds],
  (people, ids) => people.filter((person) => ids.includes(person.id)),
);
```

```tsx
const favoritePeople = useAppSelector(selectFavoritePeople);
```

- Without `createSelector`, `filter` returns a **new array** on every store update,
  and the component re-renders every time

---

# Async logic: `createAsyncThunk`

```ts
export const fetchPeople = createAsyncThunk('people/fetch', async (_: void, { signal }) => {
  return getJson<Person[]>('/api/people', { signal });
});

const peopleSlice = createSlice({
  name: 'people',
  initialState: { list: [] as Person[], status: 'idle' as 'idle' | 'loading' | 'failed' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeople.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPeople.fulfilled, (state, action) => { state.status = 'idle'; state.list = action.payload; })
      .addCase(fetchPeople.rejected, (state) => { state.status = 'failed'; });
  },
});
```

```tsx
useEffect(() => { const promise = dispatch(fetchPeople()); return () => promise.abort(); }, [dispatch]);
```

- For server data, **RTK Query** (bundled in Redux Toolkit) or TanStack Query does this
  for you — caching included

---

# Middleware — the model

<br />

```
dispatch(action) ──▶ middleware 1 ──▶ middleware 2 ──▶ … ──▶ reducers ──▶ new state
                         ▲  can log, delay, transform, swallow, dispatch other actions
```

```ts
import type { Middleware } from '@reduxjs/toolkit';

// store => next => action: three functions, set up once, called on every dispatch
export const logger: Middleware = (store) => (next) => (action) => {
  console.log('before', store.getState());
  const result = next(action);           // hand over to the next middleware… and the reducers
  console.log('after', store.getState()); // the reducers have run
  return result;
};
```

- The **only** place where side effects plug into Redux: thunks, sagas, RTK Query,
  the DevTools are all middleware
- Always `return next(action)`'s result: the middleware before you may need it

---

# A middleware of your own: persistence

```ts {*}{maxHeight:'300px'}
import { isAnyOf, type Middleware } from '@reduxjs/toolkit';

const isFavoritesAction = isAnyOf(toggle, clear);   // a type guard from action creators

export const persistFavorites: Middleware<object, RootState> = (store) => (next) => (action) => {
  const result = next(action);
  if (isFavoritesAction(action)) {
    localStorage.setItem('favorites', JSON.stringify(store.getState().favorites.ids));
  }
  return result;
};

export const store = configureStore({
  reducer: { favorites: favoritesSlice.reducer },
  preloadedState: { favorites: { ids: loadFavorites() } },      // read back at start-up
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistFavorites),
});
```

- `getDefaultMiddleware()` = thunk + the **dev-mode checks** (mutation,
  non-serialisable values): keep it, `concat` yours
- The library version: **`redux-persist`** — `persistReducer`, `persistStore`,
  `<PersistGate>`, versions and migrations

---

# The listener middleware

Redux Toolkit's answer to "when **X** is dispatched, do **Y**" — no extra package.

```ts
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

export const listener = createListenerMiddleware();

listener.startListening({
  actionCreator: searchRequested,
  effect: async (action, api) => {
    api.cancelActiveListeners();               // a newer search cancels the older one
    await api.delay(300);                      // debounce — throws if cancelled meanwhile
    const results = await searchPeople(action.payload, api.signal);
    api.dispatch(searchSucceeded(results));
  },
});

// configureStore({ …, middleware: (gDM) => gDM().prepend(listener.middleware) })
```

- Plain `async` / `await`, typed, cancellable through `api.signal`
- Covers most of what sagas were used for

---

# Redux-Saga — the idea

```shell
npm install redux-saga
```

- A **saga** is a generator function. It `yield`s **effects** — plain objects that
  *describe* work — and the saga middleware executes them

| Effect | Means |
|---|---|
| `take(type)` | wait for an action |
| `takeEvery` / `takeLatest(type, saga)` | run `saga` for every action / only for the **last** one |
| `call(fn, ...args)` | call a function, wait for its promise |
| `put(action)` | dispatch an action |
| `delay(ms)` | wait |
| `select(selector)` | read the state |
| `fork` / `cancel` / `race` / `all` | concurrency |

- Async flows read like **synchronous** code; long-running processes (polling,
  websockets, wizards) are its sweet spot

---

# A saga: debounced, cancellable search

```ts {*}{maxHeight:'330px'}
import { call, cancelled, delay, put, takeLatest } from 'redux-saga/effects';

function* search(action: PayloadAction<string>): SagaIterator {
  yield delay(300);                                   // cancelled here = debounced
  const controller = new AbortController();
  try {
    const results: Person[] = yield call(searchPeople, action.payload, controller.signal);
    yield put(searchSucceeded(results));
  } catch (error) {
    yield put(searchFailed(String(error)));
  } finally {
    if (yield cancelled()) controller.abort();        // a newer search took over
  }
}

export function* rootSaga(): SagaIterator {
  yield takeLatest(searchRequested.type, search);     // cancels the running task
}
```

```ts
const sagaMiddleware = createSagaMiddleware();
const store = configureStore({ reducer, middleware: (gDM) => gDM().concat(sagaMiddleware) });
sagaMiddleware.run(rootSaga);                         // AFTER the store exists
```

---

# Testing a saga

**End to end**: a real store, a fake API injected, a fake clock.

```ts
const api = { searchPeople: vi.fn(async () => [luke]) };
const store = makeStore({ api });            // makeStore runs the saga with this api

store.dispatch(searchRequested('luke'));
await vi.advanceTimersByTimeAsync(300);

expect(api.searchPeople).toHaveBeenCalledWith('luke', expect.any(AbortSignal));
expect(store.getState().search.results).toEqual([luke]);
```

**Step by step**: effects are data, compare them.

```ts
const gen = search(searchRequested('luke'));
expect(gen.next().value).toEqual(delay(300));
expect(gen.next().value).toEqual(call(searchPeople, 'luke', expect.any(AbortSignal)));
```

- Prefer the first: it survives a refactor of the saga's internals

---

# Thunk, listener, saga — or no Redux at all?

| Need | Tool |
|---|---|
| fetch-and-store, once | `createAsyncThunk` |
| react to actions, debounce, cancel | **listener middleware** |
| complex, long-lived flows; existing saga codebase | **Redux-Saga** |
| cache of server data | **RTK Query** / TanStack Query (ch. 17) |

<br />

- Sagas are powerful but cost a concept (generators, effects) and a dependency
- Most "async in Redux" is in fact **server cache**: RTK Query removes the slice, the
  thunk and the loading flags at once

---

# Redux DevTools

- Browser extension; `configureStore` connects to it **in development**, no code
- **Action list** with type and payload, **Diff** of the state for each action
- **Time travel**: a slider replays the app state by state
- **Trace**: the stack that dispatched an action
- **Export / import** a session: attach it to a bug report

```ts
configureStore({
  reducer,
  devTools: {
    name: 'People app',                 // tells several stores apart
    trace: true,                        // record who dispatched
    actionsDenylist: ['search/tick'],   // hide noisy actions
  },
});
```

- Same extension for **Zustand** (`devtools` middleware, ch. 19)

---

# Recap

- Keep state **local**; lift it to the common parent; reach for a context or a store only
  when far-apart components need it
- Prop drilling: try **composition** first, then a context
- Robust context = typed `createContext(null)` + Provider with `useReducer` + `useX()` that
  **throws** outside the provider; React 19 renders `<Context value>` directly
- Every consumer re-renders on a new value: **memoise** it, **split** state and dispatch,
  split by concern
- Redux Toolkit: `createSlice` (Immer), `configureStore`, `withTypes()` hooks,
  memoised selectors with `createSelector`, `createAsyncThunk` for async
- A **middleware** is `store => next => action`: the hook for side effects (persistence,
  logging); the **listener middleware** or **Redux-Saga** for async flows; the
  **DevTools** to replay it all

---

# Quiz — Question 1 / 3

**`useFavorites()` is called in a component rendered outside `<FavoritesProvider>`. With the pattern of this chapter, what happens?**

- **A.** It silently returns an empty list
- **B.** It throws "useFavorites must be used within a &lt;FavoritesProvider&gt;"
- **C.** React creates a provider automatically
- **D.** It returns the value of the closest provider of any context

<v-click>

> ✅ **B** — The context is created with `null` as default; the hook checks for it and
> throws. A missing provider is a bug: it should fail at once, loudly, instead of
> rendering wrong data.

</v-click>

---

# Quiz — Question 2 / 3

**A provider passes `value={{ favorites, toggle }}` (a new object literal) and its parent re-renders every second. What happens to the consumers?**

- **A.** Nothing, React compares the object's fields
- **B.** They all re-render every second, even if `favorites` didn't change
- **C.** Only the consumers that use `toggle` re-render
- **D.** React throws a warning and ignores the update

<v-click>

> ✅ **B** — Context compares the value with `Object.is`: a new object is a new value.
> Wrap it in `useMemo` (or let the React Compiler do it), and split state from dispatch.

</v-click>

---

# Quiz — Question 3 / 3

**Inside a Redux Toolkit reducer, `state.ids.push(action.payload)`. Is this a bug?**

- **A.** Yes, Redux state must never be mutated
- **B.** No — `createSlice` uses Immer: the "mutation" is recorded and produces a new immutable state
- **C.** Only in production
- **D.** Yes, unless you also `return state`

<v-click>

> ✅ **B** — Immer gives the reducer a draft; your changes produce a fresh state with
> structural sharing. Outside a `createSlice` / `createReducer` reducer, mutating is
> still a bug.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 12 - Sharing state: Context, then Redux Toolkit
