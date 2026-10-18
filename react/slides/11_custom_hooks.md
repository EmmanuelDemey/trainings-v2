---
layout: cover
---

# 11 - Custom hooks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Extract** stateful logic from a component into a custom hook, and **explain** what
  is shared (the logic) and what is not (the state)
- **Follow** the conventions: the `use` prefix, the rules of hooks, a typed return value
- **Choose** between returning a tuple and returning an object
- **Write** generic hooks — `useFetch<T>`, `useDebouncedValue<T>`, `useLocalStorage<T>`
  — that clean up after themselves
- **Test** a hook in isolation with `renderHook`, `rerender`, fake timers and MSW

---

# Why custom hooks

The same 15 lines, again and again:

```tsx
function PersonPage({ id }: { id: string }) {
  const [state, setState] = useState<RemoteData<Person>>({ status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getJson<Person>(`/api/people/${id}`, { signal: controller.signal })
      .then((data) => setState({ status: 'success', data }))
      .catch((error: Error) => { if (error.name !== 'AbortError') setState({ status: 'error', error }); });
    return () => controller.abort();
  }, [id]);
  // … and only now, the actual page
}
```

- Copied into every container — with the abort **forgotten** in half of them
- A custom hook is **a function that calls hooks**: you name the logic once, and reuse it

---

# The smallest example: `useCounter`

```tsx
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);   // functional update: no stale count
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

```tsx
function Counter() {
  const { count, increment, decrement, reset } = useCounter(10);
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}
```

---

# Logic is shared, state is not

```tsx
function TwoCounters() {
  const a = useCounter();   // its own useState
  const b = useCounter();   // another, independent useState
  // a.increment() never changes b.count
}
```

- Each **call** of a hook gets its own state, its own effects
- A custom hook is **copy-paste with a name**, not a shared store
- To share **state** between components, lift it up or put it in a context
  (chapter 12) or a store (chapter 19)

<br />

> A custom hook doesn't add anything to React: if you inline its body in the component,
> the behaviour is exactly the same.

---

# The conventions

- The name **starts with `use`** + a capital letter: `useFetch`, not `fetchHook`
  - the ESLint plugin `react-hooks` relies on it to check the rules of hooks
- It follows the **rules of hooks**: called at the top level, never in a condition or a loop
- It may call **other hooks**, built-in or custom
- A function that calls **no** hook is not a hook: name it `formatHeight`, not `useFormatHeight`
- Its inputs are **arguments**, its outputs a **typed** return value
- It **cleans up** what it starts: listeners, timers, requests

---

# Tuple or object?

```tsx
// tuple — like useState: the caller names the parts
export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((v) => !v);
  return [on, toggle] as const;      // as const ⇒ readonly [boolean, () => void]
}
const [isOpen, toggleOpen] = useToggle();
const [isDark, toggleDark] = useToggle(true);
```

```tsx
// object — the parts have names, order doesn't matter, easy to extend
const { data, loading, error } = useFetch<Person[]>('/api/people');
```

<br />

| Return | When |
|---|---|
| tuple `as const` | 2 values, called several times in one component |
| object | 3+ values, or values the caller may ignore |

- Without `as const`, TypeScript infers `(boolean | (() => void))[]` — useless

---

# `useFetch<T>` — the extracted pattern

```tsx
type FetchState<T> = { data: T | undefined; loading: boolean; error: Error | undefined };

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: undefined, loading: true, error: undefined });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: undefined }));

    getJson<T>(url, { signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: undefined }))
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setState({ data: undefined, loading: false, error });
      });

    return () => controller.abort();     // url changed or unmount: cancel the old request
  }, [url]);

  return state;
}
```

```tsx
const { data: person, loading, error } = useFetch<Person>(`/api/people/${id}`);
```

---

# `useDebouncedValue<T>`

```tsx
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);       // a new keystroke cancels the pending update
  }, [value, delay]);

  return debounced;
}
```

```tsx
function PeopleSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data } = useFetch<Person[]>(`/api/people?search=${encodeURIComponent(debouncedQuery)}`);
  // the input stays instant, the API is called 300 ms after the last keystroke
}
```

- Hooks **compose**: the output of one is the input of the next

---

# `useLocalStorage<T>`

```tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {         // lazy init: read once
    const stored = localStorage.getItem(key);
    return stored === null ? initialValue : (JSON.parse(stored) as T);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  useEffect(() => {                                    // another tab wrote the same key
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) setValue(event.newValue === null ? initialValue : JSON.parse(event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  return [value, setValue] as const;
}
```

- The `storage` event only fires in the **other** tabs — not in the one that wrote

---

# Subscribing to the outside world: `useSyncExternalStore`

For a value that lives **outside** React (browser API, store), this is the built-in way:

```tsx
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,                   // how to listen — a stable function, outside the hook
    () => navigator.onLine,      // read the current value (client)
    () => true,                  // value during server rendering
  );
}
```

- No `useState` + `useEffect` copy: React reads the source and never tears
- Zustand and Redux are built on it

---

# Callbacks inside effects: `useEffectEvent`

A hook takes a callback, but the effect must not restart when it changes:

```tsx
export function useInterval(callback: () => void, delay: number) {
  const onTick = useEffectEvent(callback);   // always sees the latest callback

  useEffect(() => {
    const id = setInterval(() => onTick(), delay);
    return () => clearInterval(id);
  }, [delay]);                               // onTick is NOT a dependency
}
```

```tsx
useInterval(() => setSeconds(seconds + 1), 1000);  // a new function on every render: fine
```

- Stable since **React 19.2**; before it, people stored the callback in a ref
- Only call an effect event **from inside an effect**, never during render

---

# Testing a hook: `renderHook`

```tsx
import { act, renderHook } from '@testing-library/react';

it('increments and resets the counter', () => {
  const { result } = renderHook(() => useCounter(10));

  act(() => result.current.increment());
  expect(result.current.count).toBe(11);

  act(() => result.current.reset());
  expect(result.current.count).toBe(10);
});
```

- `renderHook` mounts a tiny test component that calls your hook
- `result.current` is the **latest** return value — read it after each `act`
- `act()` flushes the state updates and effects before you assert

---

# Changing the arguments: `rerender` + fake timers

```tsx
it('only publishes the value after the delay', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
    initialProps: { value: 'l' },
  });

  rerender({ value: 'lu' });
  rerender({ value: 'luk' });
  expect(result.current).toBe('l');          // not yet

  act(() => vi.advanceTimersByTime(300));
  expect(result.current).toBe('luk');        // only the last value, once
  vi.useRealTimers();
});
```

- `initialProps` + `rerender(newProps)` simulate the parent passing new arguments

---

# Async hooks: MSW + `waitFor`

```tsx
it('returns the people from the API', async () => {
  const { result } = renderHook(() => useFetch<Person[]>('/api/people'));

  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toHaveLength(10);
});

it('exposes the error when the API fails', async () => {
  server.use(http.get('/api/people', () => HttpResponse.json(null, { status: 500 })));

  const { result } = renderHook(() => useFetch<Person[]>('/api/people'));

  await waitFor(() => expect(result.current.error).toBeDefined());
});
```

- MSW intercepts the real `fetch`: nothing of **ours** is mocked
- `server.use()` overrides a handler for **one** test; `resetHandlers()` runs after each

---

# Recap

- A custom hook is a function whose name starts with `use` and that calls other hooks
- It shares **logic**, never **state**: each call is independent
- Return a tuple `as const` for 2 values, an object otherwise; type it, generics included
- It owns its side effects: abort the request, clear the timer, remove the listener
- `useSyncExternalStore` subscribes to an external source; `useEffectEvent` reads the
  latest callback without restarting the effect
- Test with `renderHook`: `result.current`, `act`, `rerender`, fake timers, MSW + `waitFor`

---

# Quiz — Question 1 / 3

**Two components call `useCounter()`. One clicks "+1". What does the other display?**

- **A.** The new value: custom hooks share their state
- **B.** Its own, unchanged value: each call has its own state
- **C.** It depends on whether they are siblings
- **D.** An error: a custom hook can be used by one component only

<v-click>

> ✅ **B** — A custom hook reuses *logic*. Every call creates its own `useState`. Sharing
> state needs lifting it up, a context or a store.

</v-click>

---

# Quiz — Question 2 / 3

**A hook returns `[value, setValue]` without `as const`. What is the inferred type?**

- **A.** `readonly [T, (v: T) => void]`
- **B.** `[T, (v: T) => void]`
- **C.** `(T | ((v: T) => void))[]` — each element could be either
- **D.** `unknown[]`

<v-click>

> ✅ **C** — TypeScript infers an array of a union. `as const` turns it into a readonly
> tuple, so `const [value, setValue] = …` gets the right type for each position.

</v-click>

---

# Quiz — Question 3 / 3

**In a `renderHook` test, you call `result.current.increment()` without `act()`. What risk do you take?**

- **A.** None, `act` is only for components
- **B.** The state update may not be applied yet when you assert, and React warns
- **C.** The hook is unmounted
- **D.** `result.current` becomes `null`

<v-click>

> ✅ **B** — `act()` makes React process the update and its effects before the next
> line. Testing Library's `render`, `userEvent` and `waitFor` already wrap `act` for you;
> a direct call on `result.current` does not.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 11 - Custom hooks
