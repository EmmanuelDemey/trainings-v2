---
layout: cover
---

# 19 - Client state with Zustand

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** when a store beats Context, and where Zustand sits next to Redux
  Toolkit and TanStack Query
- **Create** a typed store with `create`, its state and its actions
- **Subscribe** with selectors so that a component re-renders only when **its**
  slice changes — `useShallow` included
- **Persist** a store in `localStorage` with the `persist` middleware, and debug
  it with `devtools`
- **Test** a store outside React, and the components that use it

---

# Why another state library?

<div style="display: flex; gap: 2em;">
<div>

### Context (chapter 12)

- Built in, no dependency
- Every consumer re-renders when the **value** changes — split contexts, memoize
- A Provider per piece of state
- Fine for **rarely changing** values: theme, user, locale

</div>
<div>

### Zustand

- ~1 KB, **no Provider**: the store is a module
- Components subscribe to a **slice**: no re-render for the rest
- Readable and writable **outside React** (an API client, a test)
- For **frequently changing** shared client state

</div>
</div>

<br />

- **Redux Toolkit** solves the same problem with more structure (slices, reducers,
  middleware, time-travel) — and more ceremony
- **Server data** still belongs to TanStack Query (chapter 17): Zustand is for
  **client** state — likes, filters, a cart, UI preferences

---

# Creating a store

```bash
npm install zustand
```

```ts
// src/stores/likes.ts
import { create } from 'zustand';

interface LikesState {
  likes: Record<string, number>;
  like: (id: string) => void;
  unlike: (id: string) => void;
  reset: () => void;
}

export const useLikes = create<LikesState>()((set) => ({
  likes: {},
  like: (id) => set((state) => ({ likes: { ...state.likes, [id]: (state.likes[id] ?? 0) + 1 } })),
  unlike: (id) => set((state) => ({ likes: { ...state.likes, [id]: Math.max(0, (state.likes[id] ?? 0) - 1) } })),
  reset: () => set({ likes: {} }),
}));
```

- `create<T>()(…)` — the **double call** lets TypeScript infer the middleware types
- `set` **shallow-merges** the object you return into the state: no need to spread the rest
- State is **immutable**: return new objects, never mutate `state.likes`

---

# Using the store in a component

```tsx
import { useLikes } from '../stores/likes';

export function LikeButton({ person }: { person: Person }) {
  const count = useLikes((state) => state.likes[person.id] ?? 0);
  const like = useLikes((state) => state.like);

  return (
    <button onClick={() => like(person.id)}>
      Like {person.name} ({count})
    </button>
  );
}
```

- The store **is** a hook: call it with a **selector**
- The component re-renders only when the **selected value** changes (`Object.is`)
- Actions are stable references: selecting them never causes a re-render
- No Provider to add in `main.tsx` — the store lives in the module

---

# Selectors and re-renders

```tsx
const { likes, like } = useLikes();                 // ❌ the whole state: re-renders on ANY change

const total = useLikes((state) =>                   // ✅ a derived primitive
  Object.values(state.likes).reduce((sum, n) => sum + n, 0),
);
```

```tsx
import { useShallow } from 'zustand/react/shallow';

const { like, unlike } = useLikes(                  // ✅ several fields, compared shallowly
  useShallow((state) => ({ like: state.like, unlike: state.unlike })),
);

const liked = useLikes(useShallow((state) =>        // ✅ a new array, compared item by item
  Object.keys(state.likes).filter((id) => state.likes[id] > 0),
));
```

- A selector that returns a **new object or array** each time looks like a change
  on every update — in Zustand 5, it can even loop ("Maximum update depth exceeded")
- **`useShallow`** compares the result key by key / item by item

---

# Reading and writing outside React

```ts
// anywhere: an API client, a router loader, a WebSocket handler
useLikes.getState().like('1');

const count = useLikes.getState().likes['1'];

useLikes.setState({ likes: {} });                    // merge
useLikes.setState(useLikes.getInitialState(), true);  // replace: back to the initial state

const unsubscribe = useLikes.subscribe((state, previous) => {
  console.log('likes changed', previous.likes, '→', state.likes);
});
```

- `getState`, `setState`, `subscribe`, `getInitialState` — the **vanilla** store API,
  attached to the hook
- `get` (the second argument of the creator) reads the current state inside an action:
  `create<S>()((set, get) => ({ total: () => … get().likes … }))`
- Need a store **per component tree** (e.g. one per form)? `createStore` from
  `zustand/vanilla` + a Context — the exception, not the rule

---

# Middleware: `persist`

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useLikes = create<LikesState>()(
  persist(
    (set) => ({
      likes: {},
      like: (id) => set((state) => ({ likes: { ...state.likes, [id]: (state.likes[id] ?? 0) + 1 } })),
      // …
    }),
    {
      name: 'star-wars-likes',                        // the localStorage key
      storage: createJSONStorage(() => localStorage),  // the default — sessionStorage, IndexedDB…
      partialize: (state) => ({ likes: state.likes }), // what to save: no functions
      version: 1,                                      // bump + `migrate` when the shape changes
    },
  ),
);
```

- The state is **saved on every change**, and **rehydrated** when the module loads
- `useLikes.persist.clearStorage()`, `.rehydrate()`, `.hasHydrated()` — the persist API

---

# Middleware: `devtools` and `immer`

```ts
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useLikes = create<LikesState>()(
  devtools(
    persist(
      immer((set) => ({
        likes: {},
        like: (id) =>
          set((state) => {
            state.likes[id] = (state.likes[id] ?? 0) + 1;   // a "mutation" on an Immer draft
          }),
      })),
      { name: 'star-wars-likes' },
    ),
    { name: 'Likes' },
  ),
);
```

- **`devtools`** — the store in the **Redux DevTools** extension: actions, diffs, time travel
- **`immer`** (needs the `immer` package) — write nested updates as mutations
- Order: `devtools` **outermost**, so it sees what the other middlewares do

---

# Organizing stores

- **Several small stores** by domain (`useLikes`, `useFilters`, `useCart`) rather
  than one global store
- Keep **actions in the store**, next to the state they change — components only
  call them
- Export **custom hooks** for the selectors you reuse:

```ts
export const useLikeCount = (id: string) => useLikes((state) => state.likes[id] ?? 0);
export const useLikeActions = () =>
  useLikes(useShallow((state) => ({ like: state.like, unlike: state.unlike, reset: state.reset })));
```

- A large store can be split into **slices** (`createLikesSlice`, `createFilterSlice`)
  combined in one `create` call
- **Derived** values are computed in selectors, not stored

---

# Testing a store

```ts
import { useLikes } from './likes';

beforeEach(() => {
  useLikes.setState(useLikes.getInitialState(), true);   // a clean store per test
  localStorage.clear();
});

it('counts the likes of a person', () => {
  useLikes.getState().like('1');
  useLikes.getState().like('1');

  expect(useLikes.getState().likes['1']).toBe(2);
});

it('never goes below zero', () => {
  useLikes.getState().unlike('1');

  expect(useLikes.getState().likes['1']).toBe(0);
});
```

- A store is a **module singleton**: its state survives from one test to the next.
  **Reset it** in `beforeEach`
- Pure state logic is tested **without React** — no `render`, no `act`

---

# Testing components that use a store

```tsx
it('shows the number of likes after clicking', async () => {
  const user = userEvent.setup();
  render(<LikeButton person={luke} />);

  await user.click(screen.getByRole('button', { name: /like luke skywalker/i }));

  expect(screen.getByRole('button', { name: 'Like Luke Skywalker (1)' })).toBeInTheDocument();
});

it('shows the likes already in the store', () => {
  useLikes.setState({ likes: { [luke.id]: 3 } });         // arrange through the public API

  render(<LikeButton person={luke} />);

  expect(screen.getByRole('button', { name: 'Like Luke Skywalker (3)' })).toBeInTheDocument();
});
```

- Use the **real** store — do not mock your own module
- Arrange with `setState`, assert on the **screen**
- The Zustand docs also show a `__mocks__/zustand.ts` that resets **every** store
  after each test automatically

---

# Recap

- Zustand: a **hook-shaped store**, no Provider, ~1 KB — for shared **client** state
- `create<T>()((set, get) => ({ state, actions }))`; `set` merges, never mutate
- Always **select**: `useStore((s) => s.slice)`; `useShallow` when the selector
  builds an object or an array
- `getState` / `setState` / `subscribe` work **outside React**
- **`persist`** saves to `localStorage` (`name`, `partialize`, `version`);
  **`devtools`** connects the Redux DevTools; **`immer`** for nested updates
- Tests: reset with `setState(getInitialState(), true)`, test the store
  without React, test components with the real store

---

# Quiz — Question 1 / 3

```tsx
function Header() {
  const { likes } = useLikes();
  return <h1>Star Wars people</h1>;
}
```

**Someone likes a person elsewhere on the page. Does `Header` re-render?**

- **A.** No — `Header` does not display the likes
- **B.** Yes — without a selector the component subscribes to the whole state
- **C.** No — Zustand compares `likes` shallowly by default
- **D.** Only in development, because of Strict Mode

<v-click>

> ✅ **B** — `useLikes()` with no selector returns the whole state object, and
> any `set` creates a new one. Select only what you render:
> `useLikes((s) => s.likes)` — or nothing at all here.

</v-click>

---

# Quiz — Question 2 / 3

```ts
const ids = useLikes((state) => Object.keys(state.likes));
```

**What is the problem with this selector?**

- **A.** None — Zustand memoizes selectors
- **B.** `Object.keys` is not allowed in a selector
- **C.** It returns a **new array** on every call, so the component sees a change
  every time — wrap it in `useShallow`
- **D.** It reads stale state because it is not inside `getState()`

<v-click>

> ✅ **C** — Zustand compares the selected value with `Object.is`. A fresh array
> is never equal to the previous one, so the component re-renders (and can loop).
> `useShallow` compares the items instead.

</v-click>

---

# Quiz — Question 3 / 3

**Two tests use `useLikes`. The second one fails only when run after the first.
Why, and what fixes it?**

- **A.** Vitest runs tests in parallel inside a file — add `--sequence`
- **B.** The store is a module singleton: the first test's state leaks. Reset it
  in `beforeEach` with `useLikes.setState(useLikes.getInitialState(), true)`
- **C.** `persist` is asynchronous — add `await` before each assertion
- **D.** The component must be wrapped in a `ZustandProvider`

<v-click>

> ✅ **B** — The store lives as long as the module, i.e. the whole test file.
> Resetting it (and `localStorage` when it is persisted) makes each test
> independent of the order.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 19 - Global state with Zustand
