---
layout: cover
---

# 24 - What's new in React

---

# Learning objectives

At the end of this chapter, you will be able to:

- **List** what React 19 changed: Actions, `useActionState`, `useOptimistic`,
  `use`, ref as a prop, document metadata
- **Use** the newer APIs of React 19.x: `<Activity>`, `useEffectEvent`,
  `<ViewTransition>`
- **Explain** what the React Compiler does, and **enable** it in a Vite project
- **Tell** a Server Component from a Client Component, and a Server Function
  from an event handler
- **Choose** between a Vite SPA, React Router framework mode and Next.js

---

# React 19 at a glance

<br />

| Area | What changed |
|---|---|
| **Actions** | async functions in transitions, `<form action>`, `useActionState`, `useFormStatus` (chapter 16) |
| **Optimistic UI** | `useOptimistic` |
| **Resources** | `use(promise)`, `use(context)` — even after an early return (chapter 13) |
| **Refs** | `ref` is a regular prop — `forwardRef` is no longer needed; ref callbacks can return a cleanup |
| **Context** | `<ThemeContext value={…}>` instead of `<ThemeContext.Provider>` |
| **Document** | `<title>`, `<meta>`, `<link>` rendered anywhere are hoisted to `<head>` |
| **Assets** | `preload`, `preinit`, stylesheets with `precedence` |
| **Errors** | one log per error, `onCaughtError` / `onUncaughtError` on `createRoot` |

<br />

- Removed: `propTypes` and `defaultProps` on functions, string refs, legacy context,
  `ReactDOM.render` — use `createRoot`

---

# Actions and `useOptimistic`

```tsx
function LikeButton({ person }: { person: Person }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    person.likes,
    (current, delta: number) => current + delta,
  );

  async function likeAction() {
    addOptimisticLike(1);           // shown at once
    await likePerson(person.id);    // the real request
  }                                 // then the parent passes the real, refetched `person.likes`

  return (
    <form action={likeAction}>
      <button type="submit">Like ({optimisticLikes})</button>
    </form>
  );
}
```

- An **Action** = an async function run in a **transition**: pending state,
  errors to the error boundary, ordered updates
- `useOptimistic` shows a temporary value **while** the Action runs, and drops it
  automatically when it ends — no rollback code

---

# Ref as a prop, metadata in components

```tsx
// No forwardRef: `ref` is just a prop on function components
function Input({ ref, label, ...props }: ComponentProps<'input'> & { label: string }) {
  return (
    <label>
      {label} <input ref={ref} {...props} />
    </label>
  );
}
```

```tsx
function PersonPage({ person }: { person: Person }) {
  return (
    <article>
      <title>{`${person.name} — Star Wars people`}</title>
      <meta name="description" content={`${person.name}, born ${person.birthYear}`} />
      <h1>{person.name}</h1>
    </article>
  );
}
```

- `<title>` and `<meta>` are **hoisted** into `<head>` — no `react-helmet`
- Works in a client-only app **and** with server rendering

---

# React 19.x — `<Activity>` and `useEffectEvent`

```tsx
import { Activity, useEffectEvent, useEffect } from 'react';

<Activity mode={tab === 'people' ? 'visible' : 'hidden'}>
  <PeopleTab />                     {/* hidden: kept in memory, state preserved, effects unmounted */}
</Activity>
```

```tsx
function ChatRoom({ roomId, theme }: Props) {
  const onConnected = useEffectEvent(() => {
    showToast('Connected', theme);  // always reads the LATEST theme
  });

  useEffect(() => {
    const connection = connect(roomId);
    connection.on('connected', () => onConnected());
    return () => connection.disconnect();
  }, [roomId]);                     // theme is not a dependency: no reconnect when it changes
}
```

- **`<Activity>`** — hide a subtree without losing its state (tabs, back navigation),
  and pre-render the next screen in the background
- **`useEffectEvent`** — a function called **from** an effect that reads fresh
  props without making the effect re-run

---

# React 19.x — `<ViewTransition>`

```tsx
import { ViewTransition, startTransition } from 'react';

function App() {
  const [selected, setSelected] = useState<Person | null>(null);

  return (
    <ViewTransition>
      {selected
        ? <PersonDetail person={selected} onBack={() => startTransition(() => setSelected(null))} />
        : <PeopleList onSelect={(p) => startTransition(() => setSelected(p))} />}
    </ViewTransition>
  );
}
```

- Wraps the browser's **View Transitions API**: updates in a **transition**
  animate (cross-fade by default), styled with `::view-transition-*` CSS
- `name` to morph a shared element between two screens (a thumbnail into a hero)
- `addTransitionType('forward')` to animate differently per navigation
- Also new: `cacheSignal()` for server-side caches, Performance Tracks in the
  Chrome DevTools profiler

---

# The React Compiler

```tsx
// What you write
function PeopleTable({ people, search }: Props) {
  const filtered = people.filter((p) => p.name.includes(search));
  const onSelect = (id: string) => select(id);
  return <Table rows={filtered} onSelect={onSelect} />;
}
// What the compiler emits (simplified): `filtered` and `onSelect` memoized,
// <Table> re-rendered only when people / search change
```

- A **build-time** compiler (v1.0, October 2025) that adds `useMemo` /
  `useCallback` / `memo` **for you**, at a finer grain than you would
- Requires code that follows the **Rules of React**: pure render, no mutation of
  props/state, hooks at the top level — it **skips** components that break them
- Opt-out per component: `'use no memo'`; opt-in mode: `compilationMode: 'annotation'` + `'use memo'`
- Hand-written `useMemo`/`useCallback` keep working; new code rarely needs them

---

# Enabling the React Compiler

```bash
npm install -D babel-plugin-react-compiler @rolldown/plugin-babel @babel/core
```

```ts
// vite.config.ts
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
```

- `@vitejs/plugin-react` 6 also has an experimental **Rust** port: `react({ compiler: true })`
  with `oxc-transform-react`
- Next.js: `reactCompiler: true` in `next.config.ts`; Expo: on by default
- **`eslint-plugin-react-hooks`** v7 `recommended` ships the compiler's rules: fix
  what it reports **before** enabling the compiler
- The React DevTools show a **✨ Memo** badge on compiled components

---

# Server Components

```tsx
// app/people/page.tsx — a Server Component (the default in a framework)
import { db } from '@/db';
import { LikeButton } from './LikeButton';

export default async function PeoplePage() {
  const people = await db.person.findMany();       // runs on the server, never shipped
  return (
    <ul>
      {people.map((p) => (
        <li key={p.id}>{p.name} <LikeButton id={p.id} /></li>
      ))}
    </ul>
  );
}
```

```tsx
// app/people/LikeButton.tsx
'use client';                                      // a Client Component: state, effects, events
export function LikeButton({ id }: { id: string }) { const [n, setN] = useState(0); /* … */ }
```

- Render **on the server** (at build time or per request): `async`, direct data
  access, **zero JS** sent for them
- `'use client'` marks the **boundary**: that module and its imports are bundled for
  the browser. Props crossing it must be **serializable**
- Needs a framework or bundler integration: Next.js, React Router (preview), Parcel, Waku

---

# Server Functions (Server Actions)

```ts
// app/people/actions.ts
'use server';

export async function createPerson(formData: FormData) {
  const name = String(formData.get('name'));
  await db.person.create({ data: { name } });     // runs on the server
  revalidatePath('/people');                       // Next.js: refresh the cached page
}
```

```tsx
// in a Server or Client Component
<form action={createPerson}>
  <input name="name" aria-label="Name" />
  <button type="submit">Create</button>
</form>
```

- `'use server'` exports become **endpoints**: the client calls them like functions,
  React sends a POST
- Combine with `useActionState` / `useFormStatus` / `useOptimistic` (chapter 16)
- They are **public HTTP endpoints**: validate input (Zod) and check permissions in each one

---

# Next.js

- The most used React framework (Vercel): **App Router** — file-based routes
  in `app/`, layouts, Server Components by default
- **Next.js 16**: Turbopack is the **default** bundler (dev and build), React
  Compiler support, `proxy.ts` replaces `middleware.ts`
- **Cache Components**: `'use cache'` on a function or a component makes caching
  **explicit**; with Partial Prerendering, a static shell is served at once and
  dynamic parts stream in

```tsx
// app/people/[id]/page.tsx
export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;                    // params are async since Next.js 15
  const person = await getPerson(id);
  return <h1>{person.name}</h1>;
}
```

- Good fit: SEO-critical sites, content + app mixes, full-stack teams on Vercel
  or Node hosting

---

# React Router — framework mode

```ts
// app/routes.ts
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('people/:id', 'routes/person.tsx'),
] satisfies RouteConfig;
```

```tsx
// app/routes/person.tsx
import type { Route } from './+types/person';      // generated: typed params and data

export async function loader({ params }: Route.LoaderArgs) {
  return getPerson(params.id);                     // runs on the server (or the client in SPA mode)
}

export default function Person({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>;
}
```

- The **same** router as chapter 14, plus a Vite plugin (`@react-router/dev`):
  SSR, pre-rendering, code splitting per route, **type generation**
- `react-router.config.ts`: `ssr: false` for an SPA, `prerender: [...]` for static
  pages — the successor of **Remix**; RSC support is in preview

---

# Which one?

<br />

| | Vite SPA (this training) | React Router framework | Next.js |
|---|---|---|---|
| Rendering | client only | SPA, SSR, pre-render | SSR, static, PPR, RSC |
| Server Components | — | preview | ✅ default |
| Hosting | any static host, nginx | Node, edge, static | Vercel, Node, adapters |
| Migration from an SPA | — | incremental (same router) | rewrite routing |
| Good for | dashboards, back-offices, behind a login | apps that need SSR progressively | public, SEO-heavy, full-stack |

<br />

- Also: **TanStack Start** (TanStack Router + server functions), **Astro**
  (content sites with React islands), **Expo** (React Native)
- Since October 2025, React and React Native are governed by the **React
  Foundation**, under the Linux Foundation

---

# Recap

- **React 19**: Actions and `<form action>`, `useActionState`, `useOptimistic`,
  `use`, ref as a prop, `<Context value>`, metadata hoisting
- **React 19.x**: `<Activity>` keeps hidden UI alive, `useEffectEvent` reads
  fresh values from effects, `<ViewTransition>` animates transitions
- **React Compiler 1.0** memoizes automatically — if the code follows the
  Rules of React; lint first with `eslint-plugin-react-hooks`
- **Server Components** render on the server and ship no JS; `'use client'`
  marks the boundary; **Server Functions** (`'use server'`) are public endpoints
- **Next.js** (App Router, Cache Components) and **React Router framework mode**
  bring them to production

---

# Quiz — Question 1 / 3

**With the React Compiler enabled, what happens to a component that mutates a
prop during render?**

- **A.** The compiler fixes the mutation
- **B.** The build fails
- **C.** The compiler **skips** that component (it stays uncompiled) and the lint
  rules report it
- **D.** React throws at runtime

<v-click>

> ✅ **C** — The compiler only optimizes code that follows the Rules of React.
> It bails out on what it cannot prove safe; `eslint-plugin-react-hooks`
> surfaces those violations so you can fix them.

</v-click>

---

# Quiz — Question 2 / 3

**Which of these can a Server Component do?**

- **A.** Call `useState` to keep a counter
- **B.** Attach an `onClick` handler to a `<button>`
- **C.** `await` a database query directly in its body
- **D.** Read `window.localStorage`

<v-click>

> ✅ **C** — A Server Component runs on the server, can be `async`, and never
> re-renders in the browser. State, effects, event handlers and browser APIs
> belong to Client Components (`'use client'`).

</v-click>

---

# Quiz — Question 3 / 3

**In React 19, how do you pass a `ref` to your own `Input` function component?**

- **A.** Wrap `Input` in `forwardRef` — refs are never props
- **B.** Declare `ref` in the props and pass it to the `<input>` — `ref` is a prop now
- **C.** Use `useImperativeHandle` — mandatory for every ref
- **D.** It is impossible: refs only work on DOM elements

<v-click>

> ✅ **B** — Since React 19, function components receive `ref` as a regular prop.
> `forwardRef` still works but is no longer needed, and will be deprecated.

</v-click>

---
src: ./shared/retro.md
---
