---
layout: cover
---

# 14 - React Router

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** a React Router mode, and **set up** data mode with
  `createBrowserRouter` and `RouterProvider`
- **Nest** routes under a layout that renders an `<Outlet />`, with index and 404 routes
- **Navigate** with `<Link>`, `<NavLink>` and `useNavigate`, and **read** the URL with
  `useParams` and `useSearchParams`
- **Load** a route's data before it renders with a `loader`, and **show** pending UI
- **Handle** errors per route — thrown 404s included — with an `ErrorBoundary`
- **Split** the bundle per route with `lazy`, and **test** routes with
  `createMemoryRouter`

---

# React Router

- The routing library of the React ecosystem — maps a **URL** to the **components** to render
- One package since v7, **only** one in v8: `react-router` (`react-router-dom` is gone)

```shell
npm install react-router
```

<br />

| Mode | Entry point | You get |
|---|---|---|
| **Declarative** | `<BrowserRouter>` + `<Routes>` | URL ↔ components, links, params |
| **Data** | `createBrowserRouter` + `<RouterProvider>` | + loaders, actions, pending UI, error routes, lazy routes |
| **Framework** | the `@react-router/dev` Vite plugin | + file routes, SSR, type generation (ex-Remix) |

- This chapter uses **data mode**: all the data features, in a plain Vite SPA

---

# Creating the router

```tsx
// main.tsx
import { createBrowserRouter, RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client';

const router = createBrowserRouter([
  { path: '/', Component: HomePage },
  { path: '/people/:id', Component: PersonPage },
  { path: '/about', element: <p>A Star Wars directory.</p> },
]);

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
```

- Create the router **once**, outside React — never in state or in a component
- `Component: HomePage` or `element: <HomePage />` — use one or the other
- The `RouterProvider` from `react-router/dom` adds `flushSync` support for DOM apps;
  the one from `react-router` works everywhere

---

# Nested routes and `<Outlet />`

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,                         // header + nav, on every page
    children: [
      { index: true, Component: PeoplePage },  // renders at "/"
      { path: 'people/:id', Component: PersonPage },
      { path: 'create', Component: CreatePersonPage },
      { path: '*', Component: NotFoundPage },  // anything else
    ],
  },
]);
```

```tsx
import { Outlet } from 'react-router';

function Layout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>        {/* the matching child renders here */}
    </>
  );
}
```

- A route **without `path`** is a pure layout; a route without component is a URL prefix

---

# `<Link>` and `<NavLink>`

```tsx
import { Link, NavLink } from 'react-router';

<Link to={`/people/${person.id}`}>{person.name}</Link>    // a real <a href>, no reload

<nav>
  <NavLink to="/" end>People</NavLink>                     {/* end: "/" only, not "/people/1" */}
  <NavLink
    to="/create"
    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
  >
    Create
  </NavLink>
</nav>
```

- Never `<a href>` for in-app links: it **reloads** the page and loses every state
- `NavLink` knows if it matches the URL: `className` / `style` / `children` accept a
  function of `{ isActive, isPending }`, and it sets `aria-current="page"` for you
- Relative `to` (`"edit"`, `".."`) resolves from the **route**, not the URL

---

# Reading the URL

```tsx
import { useParams, useSearchParams } from 'react-router';

function PersonPage() {
  const { id } = useParams();                 // { id: string | undefined } for /people/:id
  // …
}

function PeoplePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('q') ?? '';  // /?q=sky

  return (
    <input
      aria-label="Filter"
      value={filter}
      onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
    />
  );
}
```

- Put **shareable** state in the URL: filters, page, sort, selected tab — survives a
  refresh, works with back/forward, can be bookmarked
- `replace: true` avoids one history entry per keystroke

---

# Navigating from code

```tsx
import { useNavigate } from 'react-router';

function CreatePersonPage() {
  const navigate = useNavigate();

  const handleCreated = (person: Person) => {
    navigate(`/people/${person.id}`, { replace: true });   // no "back" to the form
  };

  return (
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <PersonForm onCreated={handleCreated} />
    </>
  );
}
```

- `navigate(to, { replace, state })` — `navigate(-1)` goes back in history
- Prefer `<Link>` whenever the user **clicks** to go somewhere: accessible, open in new
  tab, prefetchable
- In a loader or action, `return redirect('/login')` instead

---

# Loaders: data before render

```tsx
import { data, useLoaderData, type LoaderFunctionArgs } from 'react-router';

async function personLoader({ params, request }: LoaderFunctionArgs) {
  const response = await fetch(`/api/people/${params.id}`, { signal: request.signal });
  if (response.status === 404) throw data('Person not found', { status: 404 });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Person;
}

function PersonPage() {
  const person = useLoaderData<typeof personLoader>();   // typed: Person
  return <h1>{person.name}</h1>;
}

{ path: 'people/:id', loader: personLoader, Component: PersonPage }
```

- The router calls the loader **when the navigation starts**, and renders the page once
  it resolves: no loading state, no effect, no race condition
- `request.signal` aborts the fetch if the user navigates elsewhere meanwhile

---

# Pending UI

During a navigation, the **current** page stays on screen until the next loader finishes.

```tsx
import { Outlet, useNavigation } from 'react-router';

function Layout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';   // 'idle' | 'loading' | 'submitting'

  return (
    <>
      <Header />
      {isLoading && <p role="status">Loading…</p>}
      <main style={{ opacity: isLoading ? 0.6 : 1 }}>
        <Outlet />
      </main>
    </>
  );
}
```

- Navigations are wrapped in **transitions**: same "keep the old UI" behaviour as chapter 13
- `HydrateFallback` (a route field) renders during the very **first** load, before any
  page exists

---

# Error routes

```tsx
import { isRouteErrorResponse, useRouteError } from 'react-router';

function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {           // thrown with data(…, { status })
    return <h1>{error.status} — {error.data}</h1>;
  }
  return <h1>Something went wrong: {error instanceof Error ? error.message : 'unknown error'}</h1>;
}

createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: RouteError,               // catches loader, action and render errors below
    children: [/* … */],
  },
]);
```

- The **closest** route with an `ErrorBoundary` renders it, inside its parent's `<Outlet />`:
  put one on the layout's children to keep the header on error pages
- Always have one at the root — otherwise the router shows its own developer screen

---

# Lazy routes

```tsx {*}{maxHeight:'400px'}
createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: PeoplePage },                  // in the main bundle
      {
        path: 'people/:id',
        lazy: {                                                // each piece its own chunk
          loader: async () => (await import('./person/loader')).personLoader,
          Component: async () => (await import('./person/PersonPage')).PersonPage,
        },
      },
      {
        path: 'stats',
        lazy: async () => {                                    // or one function, one module
          const { StatsPage } = await import('./stats/StatsPage');
          return { Component: StatsPage };
        },
      },
    ],
  },
]);
```

- The router downloads the code **in parallel** with the loader — no `<Suspense>` needed
- Keep the **loader** in a separate small module so it doesn't wait for the component's code

---

# Actions and `<Form>`, in one slide

```tsx
import { Form, redirect, type ActionFunctionArgs } from 'react-router';

async function createPersonAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const person = await createPerson({ name: String(formData.get('name')) });
  return redirect(`/people/${person.id}`);
}

function CreatePersonPage() {
  return (
    <Form method="post">                {/* calls this route's action, no page reload */}
      <input name="name" aria-label="Name" required />
      <button type="submit">Create</button>
    </Form>
  );
}

{ path: 'create', action: createPersonAction, Component: CreatePersonPage }
```

- After an action, the router **revalidates** every loader on the page: the list is
  fresh without any manual refetch
- Chapter 16 covers forms in depth — with or without the router

---

# Testing routes

```tsx
import { createMemoryRouter, RouterProvider } from 'react-router';

function renderRoute(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });  // the real routes
  render(<RouterProvider router={router} />);
  return router;
}

it('shows the person of the URL', async () => {
  renderRoute('/people/1');
  expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
});

it('shows a 404 page for an unknown person', async () => {
  renderRoute('/people/999');
  expect(await screen.findByRole('heading', { name: /404/ })).toBeInTheDocument();
});
```

- Export the **route array** from its own module so the app and the tests share it
- `createMemoryRouter` keeps the history in memory; `router.state.location` is inspectable

---

# Deploying an SPA with client routing

`createBrowserRouter` uses real paths: a **hard refresh** on `/people/1` asks the server
for that path.

```
# Netlify — public/_redirects
/*    /index.html   200
```

```nginx
# nginx
location / { try_files $uri $uri/ /index.html; }
```

- Without this fallback, every deep link returns a **404** from the server
- `createHashRouter` (`/#/people/1`) needs no server config — at the price of ugly URLs
- Chapter 22 builds this nginx config into a Docker image

---

# Recap

- `npm i react-router` — one package; data mode = `createBrowserRouter` + `<RouterProvider>`,
  router created **once**, outside React
- Nest `children` under a layout that renders `<Outlet />`; `index: true` for the default
  child, `path: '*'` for the 404
- `<Link>` / `<NavLink>` (active class, `aria-current`) for clicks, `useNavigate` for code,
  `redirect` in loaders and actions
- `useParams` for path segments, `useSearchParams` for shareable UI state
- `loader` fetches before render (`useLoaderData<typeof loader>()`), `throw data(…, { status })`
  for expected errors, `ErrorBoundary` + `useRouteError` to show them
- `lazy` splits each route; `createMemoryRouter` tests the real routes

---

# Quiz — Question 1 / 3

**Where does the child route `{ path: 'people/:id', Component: PersonPage }` render?**

- **A.** Instead of its parent's component
- **B.** In the parent component's `<Outlet />`
- **C.** At the end of `<body>`
- **D.** In the `<RouterProvider>`'s `fallback`

<v-click>

> ✅ **B** — The parent (the layout) renders first; the matching child is rendered where
> the parent placed `<Outlet />`. That's how the header and nav stay on every page.

</v-click>

---

# Quiz — Question 2 / 3

**What is the main benefit of a route `loader` over a `useEffect` fetch in the page?**

- **A.** It caches responses forever
- **B.** The data is requested when the navigation starts, before render — no loading state, no race, errors go to the route's `ErrorBoundary`
- **C.** It works without JavaScript in an SPA
- **D.** It replaces the need for an API

<v-click>

> ✅ **B** — The router starts the loaders as soon as the URL changes (in parallel for
> nested routes), aborts stale ones via `request.signal`, and renders once the data is
> there. A thrown error or `data(…, { status: 404 })` goes to the closest `ErrorBoundary`.

</v-click>

---

# Quiz — Question 3 / 3

**Which component should render a menu item that gets an "active" style when its page is displayed?**

- **A.** `<a href="/create">`
- **B.** `<Link to="/create">` plus a `useEffect` reading `window.location`
- **C.** `<NavLink to="/create">`
- **D.** `<Navigate to="/create">`

<v-click>

> ✅ **C** — `NavLink` compares its `to` with the current location and passes
> `{ isActive }` to `className`, `style` and `children`; it also sets `aria-current="page"`.
> `<Navigate>` redirects immediately when rendered.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 14 - Routing with React Router
