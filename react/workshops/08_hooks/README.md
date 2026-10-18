# TP 8 — State & hooks

> This TP is **autonomous**: it does not depend on any other TP. The components,
> the data and the styles are provided and render a static page; your job is to
> bring it to life with `useState`, `useReducer`, `useEffect`, `useRef` and
> `useMemo`.

## Goal

Chapter 8 — Make the page interactive, one hook at a time:

- **`useState`** — a controlled input, the updater form, automatic batching
- **Derived values** computed during render, and **`useMemo`** to cache one
- **`useReducer`** — a small state machine for "which page is shown"
- **`useEffect`** — synchronise with the outside world, with a **cleanup** and
  the right **dependencies**
- **`useRef`** — a DOM node (focus), and a mutable value that must not
  re-render (a timer id)
- The **rules of hooks**

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

The specs are written and red on the starter:

- **`src/pages/HomePage.spec.tsx`** — the filter, its focus, the selection
- **`src/navigation.spec.ts`** — the reducer, as the pure function it is
- **`src/pages/PersonPage.spec.tsx`** — the details, `document.title` and its cleanup
- **`src/components/LikeButton.spec.tsx`** — the counter and its timer, with
  **fake timers**: read its `beforeEach`, it is the pattern for any component
  holding a `setTimeout`
- **`src/App.spec.tsx`** — the full round trip home → person → home

**Already done for you:**

- `src/components/Input.tsx` — a labelled input. With React 19, `ref` is a plain
  prop: `ComponentProps<'input'>` includes it, and the rest spread forwards it
- `src/components/PeopleTable.tsx` — the table; each name is a button calling
  `onSelect(person.id)`
- `src/navigation.ts` — the **types** of the navigation state and actions
- `src/utils/filterPeople.ts`, `src/utils/format.ts`, the data and the CSS

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | A controlled filter and a memoised filtered list | `src/pages/HomePage.tsx` | Typing `lars` leaves two rows |
| 2 | Navigation with `useReducer` | `src/navigation.ts` + `src/App.tsx` + `src/pages/PersonPage.tsx` | Clicking a name opens its page, Home comes back |
| 3 | `document.title` in an effect, with a cleanup | `src/pages/PersonPage.tsx` | The tab reads "Leia Organa — Star Wars people", then goes back |
| 4 | Focus the filter with a ref | `src/pages/HomePage.tsx` | The cursor is in the filter on every visit of the home page |
| 5 | A like counter with a timer in a ref | `src/components/LikeButton.tsx` | "Super like" adds two; the thanks last 2 s, restarted by each like |

## Steps

### 1. State and derived state — `src/pages/HomePage.tsx`

1. `const [query, setQuery] = useState('')`, and pass `value={query}` and
   `onChange={(event) => setQuery(event.target.value)}` to the `<Input>`. The
   input is now **controlled**: React owns its value.
2. Compute the visible people **during the render**:
   `filterPeople(people, query)`. Do not store them in a second state updated by
   an effect — that is the most common hooks anti-pattern (chapter 23 hunts it).
3. Wrap the call in `useMemo(() => …, [query])`. Add a `console.count('filter')`
   inside, type in the field, then click elsewhere: when does it run? Remove it
   afterwards.

→ **Done when** typing `lars` leaves Owen Lars and Beru Whitesun Lars, and
`jar jar` shows "No character matches."

### 2. Navigation with `useReducer` — `src/navigation.ts` + `src/App.tsx` + `src/pages/PersonPage.tsx`

1. In `navigationReducer`, handle `'showPerson'` (return
   `{ page: 'person', personId: action.personId }`) and `'goHome'`. A `switch` on
   `action.type` narrows `action`: inside `case 'showPerson'`, TypeScript knows
   `personId` exists.
2. When already home, `'goHome'` returns `state` **itself**: React compares with
   `Object.is` and skips the render when nothing changed.
3. In `App`, `useReducer(navigationReducer, initialNavigation)`. Render
   `<PersonPage>` when `navigation.page === 'person'`, `<HomePage>` otherwise,
   and dispatch from their callbacks.
4. In `PersonPage`, make the Home button call `onBack`.
5. Ask yourself why one reducer beats `useState('home')` + `useState<string>()`:
   what impossible state does the union type forbid?

→ **Done when** `navigation.spec.ts` is green and clicking a name opens the
person's page, Home brings you back.

### 3. An effect with a cleanup — `src/pages/PersonPage.tsx`

1. In a `useEffect`, save `document.title`, then set it to
   `` `${person.name} — Star Wars people` ``.
2. **Return a cleanup** that puts the saved title back. Without it, the tab keeps
   the last person's name after you go home.
3. The dependency array: `[]` would miss a change of person, no array at all
   would run on every render. Depend on the **name**.
4. `main.tsx` renders in `<StrictMode>`: in dev, React mounts, unmounts and
   remounts every component once. Your effect runs, cleans up, runs again — check
   in the tab that the result is still right. That double run is how StrictMode
   reveals a missing cleanup.
5. Unknown id: no title change. Remember: the hook must still be **called** —
   put the condition *inside* the effect, never around `useEffect`.

→ **Done when** the tab shows the person's name, and the original title is back
once you click Home.

### 4. A ref to a DOM node — `src/pages/HomePage.tsx`

1. `const filterRef = useRef<HTMLInputElement>(null)`, passed as
   `ref={filterRef}` to `<Input>`.
2. In an effect with `[]`, call `filterRef.current?.focus()`. The DOM node only
   exists **after** the render: that is why it happens in an effect.
3. Why not `autoFocus`? It would work here — compare when each runs, and what
   you would do to focus the field again after "Clear filter".

→ **Done when** the filter has the focus on load **and** every time you come
back from a person's page.

### 5. State updates and a timer in a ref — `src/components/LikeButton.tsx`

1. `useState(0)` for the likes; "Like {name}" adds one. Display `1 like` and
   `2 likes`.
2. "Super like" calls the setter **twice**. Write it as `setLikes(likes + 1)`
   twice first, and watch it add one: both calls read `likes` from the same
   render. Fix it with the **updater** form `setLikes((count) => count + 1)`.
3. After a like, show the thanks message, and hide it with a `setTimeout` of 2 s.
   Store the timer id in `useRef` — not in a state: it is never displayed, and
   changing it must not re-render. Before starting a timer, `clearTimeout` the
   previous one.
4. Add an effect with `[]` whose cleanup clears the timer: going back home 1 s
   after a like must not leave a timer running for an unmounted component.
5. Note that "Super like" sets two states (likes and the message) in one click:
   how many renders does React do? (React DevTools → Profiler, or a
   `console.count` in the body.)

→ **Done when** `LikeButton.spec.tsx` is green — super like adds two, the thanks
last 2 s, a second like restarts them, and unmounting leaves no timer.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part
of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No React warning in the browser console, StrictMode included

**The behaviour is there**

- [ ] The filter narrows the table as you type, and has the focus on every visit
- [ ] Clicking a name opens its page; Home comes back
- [ ] The tab title shows the person's name, and goes back afterwards
- [ ] "Like" adds one, "Super like" two; the thanks last 2 s, restarted by each like

**You can explain**

- [ ] Why `filterPeople(...)` is computed in the render and not kept in a state
- [ ] When the updater form `setX((x) => …)` is needed
- [ ] What the cleanup of an effect is for, and why StrictMode runs effects twice in dev
- [ ] `useRef` vs `useState`: which one re-renders, and when to pick each
- [ ] The two rules of hooks — and why a hook inside an `if` breaks React's
      bookkeeping

## Going further

- Add a "Clear filter" button that empties the query **and** puts the focus back
  in the field, through the same ref.
- Keep the filter when you come back from a person: the state is lost because
  `HomePage` unmounts. Lift it to `App`, or store it in the reducer — which do you
  prefer, and why?
- Wrap `PeopleTable` in `memo` and pass `onSelect` with and without
  `useCallback`. Use the Profiler to see when the table re-renders. Then read
  about the React Compiler (chapter 24): what would it change here?
- Install `eslint-plugin-react-hooks` and break the rules on purpose — a hook
  in an `if`, a missing dependency — to see what it reports.
