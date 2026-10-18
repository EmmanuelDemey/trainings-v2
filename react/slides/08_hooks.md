---
layout: cover
---

# 8 - State &amp; hooks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Give** a component local state with `useState`, and **update** it without
  mutating it
- **Explain** state snapshots, updater functions and automatic batching
- **Centralise** complex state transitions in a typed `useReducer`
- **Synchronise** a component with the outside world with `useEffect` — dependencies,
  cleanup, and asynchronous code done right
- **Use** `useRef` to reach a DOM node or keep a value across renders without
  re-rendering
- **Memoise** a computation with `useMemo` and a function with `useCallback` — when
  it is worth it
- **Apply** the rules of hooks

---

# Back in time — the class lifecycle

![React lifecycle](/images/react_lifecycle.png)

- Class components spread one concern over `componentDidMount`,
  `componentDidUpdate` and `componentWillUnmount`
- **Hooks** (React 16.8, 2019) group the code **by concern**, in function components

---

# What is a hook?

- A function whose name starts with **`use`**, that lets a function component
  **hook into** React features: state, effects, refs, context…
- Built-in hooks: `useState`, `useReducer`, `useEffect`, `useRef`, `useMemo`,
  `useCallback`, `useContext`, `useId`, `useTransition`, `use`…
- **Custom hooks** compose them into your own (chapter 11)

```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

- Hooks can only be called **from a component or another hook**, at the **top level**
  — the rules of hooks, at the end of this chapter

---

# `useState`

```tsx
import { useState } from 'react';

export function CollapsiblePanel({ title, children }: CollapsiblePanelProps) {
  const [opened, setOpened] = useState(true);

  return (
    <section>
      <h2>
        <button type="button" aria-expanded={opened} onClick={() => setOpened(!opened)}>
          {title}
        </button>
      </h2>
      {opened && <div>{children}</div>}
    </section>
  );
}
```

- Returns a pair: the **current value** and a **setter**
- Calling the setter **schedules a re-render** with the new value
- Each instance of the component has **its own** state
- Type inferred from the initial value; explicit when needed:
  `useState<Person | null>(null)`

---

# State is a snapshot

```tsx
export function Counter() {
  const [count, setCount] = useState(0);

  const addThree = () => {
    setCount(count + 1);   // count is 0 in this render…
    setCount(count + 1);   // …still 0
    setCount(count + 1);   // …still 0  → the result is 1, not 3
  };

  const addThreeForReal = () => {
    setCount((c) => c + 1);   // updater function: receives the latest value
    setCount((c) => c + 1);
    setCount((c) => c + 1);   // → 3
  };

  return <button onClick={addThreeForReal}>{count}</button>;
}
```

- Inside a render, `count` is a **constant**: the setter does not change it, it
  asks for a **new render**
- When the new state depends on the previous one, pass an **updater function**

---

# Updating objects and arrays

```tsx
const [person, setPerson] = useState<Person>(luke);
const [people, setPeople] = useState<Person[]>([]);

// ❌ mutation: same reference, React sees no change, no re-render
person.height = 180;
people.push(leia);

// ✅ a new object / a new array
setPerson({ ...person, height: 180 });
setPerson((p) => ({ ...p, homeworld: { ...p.homeworld, name: 'Naboo' } }));

setPeople([...people, leia]);                                // add
setPeople(people.filter((p) => p.id !== id));                // remove
setPeople(people.map((p) => (p.id === id ? { ...p, liked: true } : p)));   // update
setPeople(people.toSorted(byName));                          // sort a copy
```

- React compares state with `Object.is`: **same reference = no update**
- Treat state as **immutable** — chapter 4's spread, `map`, `filter`, `toSorted`

---

# Initial state and derived values

```tsx
// ❌ readFavorites() runs on every render, its result ignored after the first
const [favorites, setFavorites] = useState(readFavorites());

// ✅ lazy initialiser: the function runs once, on mount
const [favorites, setFavorites] = useState(() => readFavorites());
```

```tsx
export function PeoplePage({ people }: { people: Person[] }) {
  const [filter, setFilter] = useState('');

  // ✅ derived during render — not stored in a second state
  const visible = people.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <PeopleFilter value={filter} onChange={setFilter} />
      <PeopleTable people={visible} />
    </>
  );
}
```

- Store the **minimum**; compute the rest while rendering
- A state that can be computed from props or other state is a bug waiting to happen

---

# Automatic batching

```tsx
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);            // ┐ one single render
    const result = await login(email);
    setSubmitting(false);           // ┐ one single render, after the await too
    if (!result.ok) setError(result.message);
  };
  // …
}
```

- Since **React 18**, all the updates of the same event — in handlers, promises,
  timeouts — are **batched** into one render
- `flushSync` from `react-dom` forces a synchronous update (rarely needed)

---

# `useReducer`

```tsx
type State = { page: 'home' } | { page: 'person'; personId: string };

type Action =
  | { type: 'open-person'; personId: string }
  | { type: 'go-home' };

function navigationReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open-person':
      return { page: 'person', personId: action.personId };
    case 'go-home':
      return { page: 'home' };
  }
}

export function App() {
  const [state, dispatch] = useReducer(navigationReducer, { page: 'home' });

  return state.page === 'home'
    ? <PeoplePage onSelect={(id) => dispatch({ type: 'open-person', personId: id })} />
    : <PersonPage id={state.personId} onBack={() => dispatch({ type: 'go-home' })} />;
}
```

---

# `useState` or `useReducer`?

- A **reducer** is a pure function `(state, action) => newState`: every transition
  in one place, easy to unit test without React
- Components **dispatch** what happened (`'open-person'`), not how the state changes
- Discriminated unions type both the **state** and the **actions** — the `switch`
  is exhaustive

<br />

| Use `useState` when… | Use `useReducer` when… |
|---|---|
| independent, simple values | several values change **together** |
| a boolean, a string, a number | the next state depends on the action **and** the previous state |
| few update sites | many update sites, or logic worth testing on its own |

> The same pattern, shared through Context, is the core of chapter 12.

---

# `useEffect` — synchronising with the outside

```tsx
import { useEffect, useState } from 'react';

export function PeopleCounter({ count }: { count: number }) {
  useEffect(() => {
    document.title = `${count} people — Star Wars`;
  }, [count]);

  return <p>{count} people</p>;
}
```

- An effect runs **after** the render is committed to the screen
- For **side effects** that synchronise with a system outside React: the document
  title, a subscription, a timer, the network, a third-party widget
- Not for computing values — that belongs in the render

| Dependencies | The effect runs… |
|---|---|
| `[count]` | after the first render, then whenever `count` changed |
| `[]` | once, after the first render (twice in dev `StrictMode`) |
| omitted | after **every** render — rarely what you want |

---

# Effect cleanup

```tsx
export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);        // cleanup
  }, []);

  return <time>{now.toLocaleTimeString()}</time>;
}

useEffect(() => {
  const previous = document.title;
  document.title = `${person.name} — Star Wars`;
  return () => { document.title = previous; };   // restore on unmount or change
}, [person.name]);
```

- The returned function runs **before the next effect** and **on unmount**
- Every subscription, timer or listener needs one — `StrictMode` mounts, unmounts and
  remounts in development to prove it is there
- Dependencies are **not optional**: list every value the effect reads
  (`react-hooks/exhaustive-deps` checks it)

---

# Naming effects

```tsx
useEffect(function syncDocumentTitle() {
  document.title = `${count} people — Star Wars`;
}, [count]);

useEffect(function subscribeToResize() {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
```

- A component with several effects quickly becomes hard to read
- A **named function** says what each effect is for — and shows up in stack traces
- Even better: move each effect into a **custom hook** —
  `useDocumentTitle(title)`, `useWindowWidth()` (chapter 11)

---

# Asynchronous code in `useEffect`

```tsx
// ❌ an async function returns a Promise — React expects a cleanup function or nothing
useEffect(async () => {
  const response = await fetch(`/api/people/${id}`);
  setPerson(await response.json());
}, [id]);
```

```tsx
// ✅ a synchronous effect that starts an async function — and can clean it up
useEffect(() => {
  const controller = new AbortController();

  async function fetchPerson() {
    try {
      const response = await fetch(`/api/people/${id}`, { signal: controller.signal });
      setPerson(await response.json());
    } catch (error) {
      if (!controller.signal.aborted) setError(error as Error);
    }
  }

  fetchPerson();
  return () => controller.abort();   // id changed or unmounted: drop the stale request
}, [id]);
```

- Without the abort, a slow response for an **old** `id` can overwrite the new one —
  a race condition (chapter 9)

---

# You might not need an effect

```tsx
// ❌ derived state synchronised by an effect: an extra render, and a stale frame
const [visible, setVisible] = useState<Person[]>([]);
useEffect(() => {
  setVisible(people.filter((p) => p.name.includes(filter)));
}, [people, filter]);

// ✅ computed during render
const visible = people.filter((p) => p.name.includes(filter));
```

```tsx
// ❌ an event's logic in an effect
useEffect(() => {
  if (submitted) showToast('Saved');
}, [submitted]);

// ✅ in the event handler — that is where you know what happened
const handleSave = async () => {
  await save(person);
  showToast('Saved');
};
```

- Effects are for **synchronising with external systems**, not for reacting to your
  own state — React Doctor (chapter 23) flags these patterns

---

# `useRef` — accessing the DOM

* Returns an object `{ current: value }` that **persists** across renders
* Two main use cases
  * Access a **DOM element** (focus, scroll, measuring, a third-party library)
  * Keep a mutable value **without triggering a re-render**

```tsx
import { useRef } from 'react';

export function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={inputRef} aria-label="Search" />
      <button onClick={() => inputRef.current?.focus()}>Search</button>
    </>
  );
}
```

- React sets `inputRef.current` to the DOM node after mounting, back to `null` on
  unmount

---

# `useRef` — a value that survives renders

* Useful to store a technical value: a timer id, a previous value, an instance…
* Changing `ref.current` does **not** trigger a re-render

```tsx
export function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const stop = () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };
  const start = () => {
    stop();
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  useEffect(() => stop, []);   // clear the timer on unmount

  return (
    <p>
      {seconds}s <button onClick={start}>Start</button> <button onClick={stop}>Stop</button>
    </p>
  );
}
```

---

# `useRef` — the rules, and ref as a prop

* Data shown on screen must stay in **`useState`**
* Do not read or write `ref.current` **during rendering** — only in handlers and effects
* Since **React 19**, a function component receives `ref` as a regular prop: no more
  `forwardRef`

```tsx
// ❌ the display never updates: changing a ref does not re-render
export function Counter() {
  const count = useRef(0);
  return <button onClick={() => count.current++}>{count.current}</button>;
}
```

```tsx
// React 19: ref is passed like any other prop
import type { ComponentProps } from 'react';

export function Input({ ref, ...props }: ComponentProps<'input'>) {
  return <input ref={ref} {...props} />;
}

// <Input ref={inputRef} name="filter" />
```

---

# `useMemo` — caching a computation

```tsx
import { useMemo, useState } from 'react';

export function PeoplePage({ people }: { people: Person[] }) {
  const [filter, setFilter] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const visible = useMemo(
    () =>
      people
        .filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    [people, filter],     // recomputed only when one of these changes
  );

  return (
    <div data-theme={darkMode ? 'dark' : 'light'}>
      <button onClick={() => setDarkMode(!darkMode)}>Toggle theme</button>
      <PeopleFilter value={filter} onChange={setFilter} />
      <PeopleTable people={visible} />
    </div>
  );
}
```

- Toggling the theme re-renders, but **reuses** the filtered list
- Worth it for **expensive** computations, or to keep a **stable reference** passed
  to a memoised child or used as an effect dependency

---

# `useCallback` and `memo`

```tsx
import { memo, useCallback, useState } from 'react';

const PersonRow = memo(function PersonRow({ person, onLike }: PersonRowProps) {
  return (
    <tr>
      <td>{person.name}</td>
      <td><button onClick={() => onLike(person.id)}>Like</button></td>
    </tr>
  );
});

export function PeopleTable({ people }: { people: Person[] }) {
  const [liked, setLiked] = useState<string[]>([]);

  const handleLike = useCallback((id: string) => {
    setLiked((ids) => [...ids, id]);          // updater: no dependency on liked
  }, []);

  return <table><tbody>{people.map((p) => <PersonRow key={p.id} person={p} onLike={handleLike} />)}</tbody></table>;
}
```

- `useCallback(fn, deps)` = `useMemo(() => fn, deps)`: the **same function** across renders
- `memo` skips a child's render when its props are the same — useless if a new
  function is passed on every render

---

# Memoisation — when it is worth it

- **Measure first** (React DevTools Profiler): most renders are cheap
- Worth it for:
  - an expensive computation (sorting thousands of rows, parsing)
  - a value or function passed to a `memo` child
  - a value or function used as a **dependency** of another hook
- Not worth it for: cheap computations, primitive values, handlers passed to native
  elements (`<button onClick>`)

<br />

> The **React Compiler** (chapter 24) inserts this memoisation automatically at build
> time. In a compiled project, hand-written `useMemo` / `useCallback` become rare —
> but you still need to understand what they do.

---

# The rules of hooks

```tsx
export function PersonDetails({ person }: { person: Person | null }) {
  // ❌ a hook after an early return — not called on every render
  if (!person) return <p>Select someone</p>;
  const [liked, setLiked] = useState(false);

  // ❌ a hook in a condition or a loop
  if (person.height > 200) useEffect(() => {});

  // …
}
```

1. Call hooks **only at the top level** — never in conditions, loops, nested functions
   or after an early `return`
2. Call hooks **only from React functions** — components and custom hooks
   (`useSomething`), never from plain functions or classes

- Why: React identifies each hook by its **call order** — the order must be the same
  on every render
- `eslint-plugin-react-hooks` (`rules-of-hooks`) enforces both rules

---

# Recap

- `useState` → a value + a setter; state is a **snapshot**, updater functions read
  the latest value; never mutate — create new objects and arrays
- Store the minimum, **derive** the rest during render; lazy initialiser for costly
  initial values
- Updates of one event are **batched** into one render
- `useReducer` for transitions that belong together, typed with discriminated unions
- `useEffect` **synchronises** with external systems: full dependencies, a cleanup,
  never an `async` callback — an inner async function + `AbortController`
- `useRef` for DOM nodes and values that must not re-render; ref is a **prop** in React 19
- `useMemo` / `useCallback` + `memo` when a measurement says so
- Hooks at the **top level**, from components and custom hooks only

---

# Quiz — Question 1 / 3

**`count` is `0`. A click runs `setCount(count + 1); setCount(count + 1);`. What
does the next render show?**

- **A.** `2`
- **B.** `1`
- **C.** `0`
- **D.** It depends on batching

<v-click>

> ✅ **B** — `count` is a snapshot: both calls compute `0 + 1`. Use the updater form,
> `setCount((c) => c + 1)`, to chain updates based on the latest value.

</v-click>

---

# Quiz — Question 2 / 3

**Why is `useEffect(async () => { … }, [id])` wrong?**

- **A.** Effects cannot call `fetch`
- **B.** An `async` function returns a Promise, but React expects the effect to return
  a cleanup function or nothing
- **C.** `async` functions are not supported in TSX
- **D.** It is fine, as long as `id` is in the dependencies

<v-click>

> ✅ **B** — React would treat the Promise as a cleanup and you lose any real cleanup.
> Declare an async function **inside** a synchronous effect, call it, and return a
> cleanup that aborts the request.

</v-click>

---

# Quiz — Question 3 / 3

**You need to store an interval id so that a "Stop" button can clear it. The id is
never displayed. Which hook?**

- **A.** `useState`
- **B.** `useMemo`
- **C.** `useRef`
- **D.** `useCallback`

<v-click>

> ✅ **C** — A ref keeps a mutable value across renders **without** re-rendering when
> it changes. `useState` would trigger a useless render; `useMemo` is a cache that
> React may discard.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 8 - State &amp; hooks

---
src: ./shared/retro.md
---
