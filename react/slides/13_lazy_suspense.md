---
layout: cover
---

# 13 - Lazy loading, Suspense and transitions

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Split** the bundle with dynamic `import()` and `React.lazy`, and **check** the
  result in the build output
- **Show** a fallback while code or data loads with `<Suspense>`, and **place** the
  boundaries to control what the user sees
- **Read** a promise during render with `use()` — and **explain** why the promise
  must be cached
- **Combine** `Suspense` with an error boundary for the error case
- **Keep** the current UI visible while the next one loads with `useTransition` and
  `startTransition`

---

# Why split the bundle

A single `index.js` contains **every page**, even the ones the user never opens:

```shell
dist/assets/index-B1k2.js     812.40 kB │ gzip: 241.20 kB   ← everyone downloads this
```

- Longer download, longer parse, slower first paint — especially on mobile
- The **admin** page, the **chart** library, the **PDF export** are needed by few users,
  and later

<br />

Lazy loading:

- loads a part of the application **only when it is needed**
- reduces the **initial** JavaScript
- does not download resources nobody uses (#greenIT)

---

# Dynamic `import()`

```ts
// static: bundled with the importer, loaded at startup
import { exportToPdf } from './pdf';

// dynamic: a separate chunk, loaded on demand — returns a Promise of the module
button.addEventListener('click', async () => {
  const { exportToPdf } = await import('./pdf');
  exportToPdf(people);
});
```

```shell
dist/assets/index-B1k2.js     402.10 kB
dist/assets/pdf-Dx9a.js       410.30 kB   ← its own file, fetched on first click
```

- Standard JavaScript, understood by Vite / Rollup: **every** `import()` creates a chunk
- `React.lazy` is the same thing for **components**

---

# `React.lazy`

```tsx
import { lazy, Suspense } from 'react';

// the module must have a DEFAULT export that is a component
const PersonStats = lazy(() => import('./PersonStats'));

// named export? map it to { default }
const Charts = lazy(() => import('./Charts').then((m) => ({ default: m.Charts })));

export function PersonPage() {
  return (
    <>
      <h1>Luke Skywalker</h1>
      <Suspense fallback={<p role="status">Loading the statistics…</p>}>
        <PersonStats />
      </Suspense>
    </>
  );
}
```

- Call `lazy` at the **top level** of a module — never inside a component (it would
  create a new component, and reset its state, on every render)
- The chunk is requested the first time `<PersonStats />` **renders**

---

# `<Suspense>`: how it works

<br />

1. A component below **suspends**: it isn't ready (lazy code, `use(promise)`, …)
2. React looks for the **closest `<Suspense>`** above it
3. It shows that boundary's `fallback` instead of its **whole** content
4. When the promise resolves, React retries the render and shows the content

<br />

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />          {/* ready, but hidden too while a sibling suspends */}
  <PersonStats />     {/* suspends */}
</Suspense>
```

- A boundary shows **all or nothing** of its children: that's what avoids a UI popping
  in piece by piece
- No `<Suspense>` above a suspending component? The whole root waits

---

# Placing the boundaries

```tsx
<Suspense fallback={<AppSkeleton />}>            {/* first load of the app */}
  <Layout>
    <Suspense fallback={<TableSkeleton />}>      {/* the list can wait on its own */}
      <PeopleTable />
    </Suspense>
    <Suspense fallback={<CardSkeleton />}>       {/* the details too */}
      <PersonDetails id={id} />
    </Suspense>
  </Layout>
</Suspense>
```

- **Nest** boundaries to reveal the page in meaningful steps, outermost first
- One boundary per region that makes sense **alone**
- Design the fallback as a **skeleton** of the final layout to avoid layout shifts

---

# Reading a promise with `use()`

```tsx
import { use } from 'react';

function PersonDetails({ personPromise }: { personPromise: Promise<Person> }) {
  const person = use(personPromise);       // suspends until the promise resolves
  return <h2>{person.name}</h2>;
}
```

```tsx
<Suspense fallback={<p role="status">Loading…</p>}>
  <PersonDetails personPromise={fetchPerson(id)} />
</Suspense>
```

- No `useEffect`, no `loading` state: the **component** is written for the happy path,
  the **boundary** handles the waiting
- Unlike other hooks, `use` may be called **inside a condition or a loop**
- `use(Context)` also works — a conditional `useContext`

---

# The promise must be cached

```tsx
function PersonDetails({ id }: { id: string }) {
  const person = use(fetchPerson(id));     // ❌ a new promise on every render
  return <h2>{person.name}</h2>;
}
```

- Suspend → retry → **new** promise → suspend again… forever
- React (and the `react-hooks` lint) warn about promises created during render

<br />

```ts
// ✅ one promise per id, created once, reused on every render
const cache = new Map<string, Promise<Person>>();

export function fetchPersonCached(id: string): Promise<Person> {
  if (!cache.has(id)) cache.set(id, getJson<Person>(`/api/people/${id}`));
  return cache.get(id)!;
}
```

- In real apps the promise comes from a **router loader** (ch. 14) or a data library
  (ch. 17), which own the cache

---

# Errors: Suspense + error boundary

`Suspense` handles **waiting**. A **rejected** promise is **thrown** to the nearest error boundary:

```tsx
<ErrorBoundary fallback={<p role="alert">Could not load this person.</p>} resetKeys={[id]}>
  <Suspense fallback={<p role="status">Loading…</p>}>
    <PersonDetails personPromise={fetchPersonCached(id)} />
  </Suspense>
</ErrorBoundary>
```

<br />

| State of the promise | What renders |
|---|---|
| pending | the `Suspense` fallback |
| fulfilled | `PersonDetails` |
| rejected | the `ErrorBoundary` fallback |

- The same pair also protects a lazy component whose **chunk** fails to download

---

# The problem: the fallback flashes

The user goes from Luke to Leia. `PersonDetails` suspends on the new promise:

```text
[ Luke details ]  ──click Leia──►  [ Loading… ]  ──►  [ Leia details ]
                                       ↑ the content disappears
```

- For a **first** load, a fallback is right
- For an **update**, hiding content the user was reading is jarring
- Better: **keep Luke** on screen, show a subtle pending hint, swap to Leia when ready

---

# `useTransition`

```tsx
function PeopleBrowser() {
  const [id, setId] = useState('1');
  const [isPending, startTransition] = useTransition();

  const select = (nextId: string) => {
    startTransition(() => setId(nextId));   // a non-urgent update
  };

  return (
    <>
      <PeopleList onSelect={select} />
      <div style={{ opacity: isPending ? 0.6 : 1 }} aria-busy={isPending}>
        <Suspense fallback={<p role="status">Loading…</p>}>
          <PersonDetails personPromise={fetchPersonCached(id)} />
        </Suspense>
      </div>
    </>
  );
}
```

- An update inside a transition **does not** show an already-visible fallback again:
  React keeps the old UI until the new one is ready
- `isPending` is `true` meanwhile — dim the content, show a spinner

---

# Transitions also keep the UI responsive

```tsx
const [query, setQuery] = useState('');
const [filter, setFilter] = useState('');
const [isPending, startTransition] = useTransition();

<input
  value={query}
  onChange={(e) => {
    setQuery(e.target.value);                         // urgent: the input stays instant
    startTransition(() => setFilter(e.target.value)); // can be interrupted by the next keystroke
  }}
/>
<HugeList filter={filter} />
```

- A transition render is **interruptible**: a new keystroke abandons the stale one
- `useDeferredValue(value)` gives the same effect when you only **receive** the value

<br />

| API | Use it… |
|---|---|
| `useTransition` | in a component — you get `isPending` |
| `startTransition` (import from `react`) | outside components, or when you don't need `isPending` |

---

# Actions: async transitions (React 19)

```tsx
const [isPending, startTransition] = useTransition();

const handleLike = () => {
  startTransition(async () => {
    await likePerson(person.id);                   // isPending stays true during the await
    startTransition(() => setLiked(true));         // updates after an await: wrap again
  });
};

<button onClick={handleLike} disabled={isPending}>
  {isPending ? 'Saving…' : 'Like'}
</button>
```

- An async function passed to `startTransition` is an **Action**
- `isPending` covers the **whole** async work — no manual `loading` state
- An error thrown in an Action goes to the nearest **error boundary**
- Forms build on this: `useActionState` and `<form action>` in chapter 16

---

# Recap

- `import()` creates a chunk; `lazy(() => import('./X'))` makes it a component — declared
  at **module level**, default export
- `<Suspense fallback>` shows a fallback while **anything** below suspends; nest boundaries
  to reveal the page step by step
- `use(promise)` reads a promise during render — the promise must be **cached**, not
  created in render
- Pair every `Suspense` with an **error boundary** for rejections and failed chunks
- `useTransition` / `startTransition` mark updates as non-urgent: the old UI stays,
  `isPending` tells you it's coming
- Async functions in `startTransition` are **Actions** (React 19)

---

# Quiz — Question 1 / 3

**Why must `const Stats = lazy(() => import('./Stats'))` be at the top level of a module?**

- **A.** `lazy` is a hook
- **B.** Inside a component it would create a new component type on every render, remounting it and losing its state
- **C.** Vite only splits top-level imports
- **D.** It is a style convention without consequence

<v-click>

> ✅ **B** — `lazy` returns a component type. A new type on each render means React
> unmounts the old subtree and mounts a new one — state lost, possibly an infinite
> suspend loop.

</v-click>

---

# Quiz — Question 2 / 3

**`use(fetchPerson(id))` is called directly in the component. What happens?**

- **A.** It works: React deduplicates identical requests
- **B.** A new promise is created on every render: the component suspends again and again
- **C.** It throws a type error at compile time
- **D.** It behaves like `useEffect`

<v-click>

> ✅ **B** — After the promise resolves React re-renders, which creates another promise,
> which suspends… Create the promise outside render (loader, cache, data library) and pass
> it down.

</v-click>

---

# Quiz — Question 3 / 3

**The details of Luke are visible. The user selects Leia and you want Luke to stay on screen until Leia is ready. What do you use?**

- **A.** A second `<Suspense>` around the first
- **B.** `startTransition(() => setId('5'))`
- **C.** `useEffect` with a `loading` flag
- **D.** `lazy()` around `PersonDetails`

<v-click>

> ✅ **B** — Inside a transition, React does not replace already-revealed content with a
> fallback; it keeps the previous UI and sets `isPending` until the new render can commit.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 13 - Lazy loading, Suspense and transitions
