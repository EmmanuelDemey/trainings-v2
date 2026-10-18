# TP 11 — Custom hooks

> This TP is **autonomous**: it does not depend on any other TP. A character search
> with favorites is provided and half working, over a fake API (MSW); your job is to
> extract its logic into three reusable hooks, and to test them with `renderHook`.

## Goal

Chapter 11 — Write, use and test your own hooks:

- **Extract** stateful logic out of a component into a `use…` function — and see that
  each caller gets its own state
- **`useFetch<T>(url)`**: `{ data, loading, error }`, aborting the previous request when
  the URL changes
- **`useDebouncedValue(value, delay)`**: a timer in an effect, cleared on every change
- **`useLocalStorage(key, initial)`**: persisted state, in sync across components and tabs,
  with `useSyncExternalStore`
- **Test hooks** on their own with `renderHook`, `rerender`, `act`, fake timers and MSW

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the fake API runs in a Service Worker
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs that grade this TP are already written: **`src/hooks/useFetch.spec.ts`**,
**`src/hooks/useDebouncedValue.spec.ts`**, **`src/hooks/useLocalStorage.spec.ts`** and
**`src/App.spec.tsx`**. Read them before you start: they test each hook **without any
component of the app**, through `renderHook`:

```ts
const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
  initialProps: { value: 'l' },
});
rerender({ value: 'lu' });               // the hook is called again with new arguments
act(() => vi.advanceTimersByTime(300));  // fake time passes, React applies the update
expect(result.current).toBe('lu');       // what the hook returned on the last render
```

**Already done for you:**

- `src/mocks/` — the fake API (`GET /api/people?search=…`, `GET /api/people/:id`), in a
  Service Worker for `npm run dev` and in Node for the specs (`src/tests/setup.ts`, with
  `onUnhandledFrame: 'error'`: an unexpected request fails the test).
- `src/people/PeopleSearch.tsx` — a working search, fetching **inline** the way TP 9 did,
  without debounce and without abort.
- `src/people/FavoriteButton.tsx` and `FavoritesCount.tsx` — they already call
  `useLocalStorage`, whose starter version is a plain `useState`: each one has its own
  copy, and nothing survives a reload.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Extract `useFetch`, with abort | `src/hooks/useFetch.ts` + `PeopleSearch.tsx` | `useFetch.spec.ts` is green |
| 2 | `useDebouncedValue`, and use it for the search | `src/hooks/useDebouncedValue.ts` + `PeopleSearch.tsx` | Typing "skywalker" sends **one** request |
| 3 | `useLocalStorage`, synced across components and tabs | `src/hooks/useLocalStorage.ts` | The star and the header counter agree, even after a reload |

## Steps

### 1. `useFetch<T>(url)` — `src/hooks/useFetch.ts`

1. Move the three `useState`s and the `useEffect` of `PeopleSearch` into `useFetch`, with
   `url` as the effect's only dependency. Return `{ data, loading, error }`.
2. Handle `url === null`: send nothing and report `loading: false`. It lets a caller
   say "not yet" without breaking the rules of hooks — a hook can never be called
   conditionally, but its argument can be.
3. Create an `AbortController` per run of the effect, pass its `signal` to `fetch`, abort
   it in the cleanup, and ignore the rejection of an aborted request.
4. In `PeopleSearch`, replace the inline code with
   `const { data: people, loading, error } = useFetch<Person[]>(url)`. Check that the
   now-unused imports are gone: `npm run typecheck` flags them.

→ **Done when** `useFetch.spec.ts` is green, and `PeopleSearch` has no `useEffect` left.

### 2. `useDebouncedValue(value, delay = 300)` — `src/hooks/useDebouncedValue.ts`

1. Hold the debounced value in a state initialised with `value`.
2. In an effect depending on `[value, delay]`, schedule `setDebounced(value)` with
   `setTimeout`, and `clearTimeout` it in the cleanup. That cleanup is the whole trick:
   every keystroke cancels the previous timer.
3. In `PeopleSearch`, build the URL from `useDebouncedValue(query.trim(), 300)` instead of
   `query`. Open the Network tab and type `skywalker`: one request, not nine.

→ **Done when** `useDebouncedValue.spec.ts` is green — it drives time with
`vi.useFakeTimers()` and `vi.advanceTimersByTime()`, no real waiting.

### 3. `useLocalStorage(key, initialValue)` — `src/hooks/useLocalStorage.ts`

1. **Read**: parse `localStorage.getItem(key)` as JSON, falling back to `initialValue`
   when nothing is stored or the JSON is corrupted (`try` / `catch`).
2. **Write**: the setter accepts a value or an updater `(previous) => next`, like
   `useState`'s, and stores `JSON.stringify(next)`.
3. **Sync**: two components calling `useLocalStorage('favorites', …)` are two separate
   states — click a star, the header counter does not move. `localStorage` is an
   *external store*, and `useSyncExternalStore(subscribe, getSnapshot)` is the hook to
   read one:
   - `getSnapshot` returns the **raw string** — it compares with `Object.is`, so a freshly
     parsed array would look new on every call and re-render forever. Parse it in a
     `useMemo` keyed on that string.
   - `subscribe` listens to the `storage` event — fired in the **other** tabs only — and
     to a custom event the setter dispatches on `window` for **this** tab.
4. Open the app in two tabs and star a character in one of them.

→ **Done when** `useLocalStorage.spec.ts` and `App.spec.tsx` are green: the header
counter follows the stars, the favorites survive a reload, and a second tab follows.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `PeopleSearch` has no `useEffect` and no `fetch` of its own
- [ ] Typing `skywalker` quickly sends a single request (Network tab)
- [ ] Changing the search aborts the request still in flight (shown as *cancelled*)
- [ ] Starring a character updates the header counter immediately, survives a reload,
      and shows up in a second tab

**You can explain**

- [ ] What makes a function a hook — and why two components calling the same hook do
      **not** share its state
- [ ] Why `useFetch` takes `null` instead of being called inside an `if`
- [ ] Why `useSyncExternalStore`'s snapshot must be the string and not the parsed value
- [ ] What `renderHook`'s `result.current`, `rerender` and `act` each do

## Going further

- Add a `reload()` to `useFetch`'s result (a counter in the effect's dependencies), and a
  spec for it.
- Return a discriminated union from `useFetch` (`{ status: 'loading' } | { status:
  'error'; error } | { status: 'success'; data }`) and see what TypeScript now forces
  the callers to handle.
- Write `useMediaQuery(query)` with `useSyncExternalStore` over `window.matchMedia`.
- Compare your `useFetch` with TanStack Query's `useQuery` (chapter 17): cache,
  deduplication, retries, refetch on focus — what would each cost you to add here?
