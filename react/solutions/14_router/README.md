# TP 14 — Routing with React Router

> This TP is **autonomous**: it does not depend on any other TP. The pages, the
> fake API (MSW) and its fetch functions are provided; your job is to turn a
> single page into a routed application with React Router 8 in **data mode**:
> nested routes, loaders, URL state and error routes.

## Goal

Chapter 14 — Build the routing layer of the Star Wars people app:

- **`createBrowserRouter` + `RouterProvider`**, and a **layout route** with `<Outlet />` and `<NavLink>`
- **Loaders** that fetch before the page renders, typed with `useLoaderData<typeof loader>()`
- **Dynamic segments** (`/people/:id`), `<Link>` and `useNavigate`
- **URL state** with `useSearchParams`, so the filter survives a reload and "Back"
- **Error routes**: a thrown 404, an API failure, an unknown URL
- **Lazy routes**: the person page in its own chunk

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 9 (data fetching) helps: the loaders call plain `fetch` functions

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the API answers after ~600 ms
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are already written and red on the starter. Keep
`npm run test:watch` open in a second terminal and turn them green:

- **`src/router.spec.tsx`**: the layout, the navigation links and the 404 page (step 1)
- **`src/pages/PeoplePage.spec.tsx`**: the loader, the links and the URL filter (steps 2 to 4)
- **`src/pages/PersonPage.spec.tsx`**: the person route, "Back" and the error element (steps 3 and 5)

They all go through `src/tests/render.tsx`, which builds a `createMemoryRouter`
from **your** `routes` and renders it at a given URL. The specs test the real
route tree, the way a user would reach it.

**Already done for you:**

- `src/mocks/`, the fake API: `GET /api/people?q=…` (filtered by name) and
  `GET /api/people/:id` (404 for an unknown id). The browser gets it through a
  service worker started in `src/main.tsx`, Node (the specs) through
  `setupServer` in `src/tests/setup.ts`.
- `src/api/people.ts`: `fetchPeople(q, signal)` and `fetchPerson(id, signal)`,
  which gives `null` on a 404.
- `src/main.tsx`: `createBrowserRouter(routes)` and the DOM `<RouterProvider>`.
- `CreatePage`, `NotFoundPage` and `Loader`, ready to be routed.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The layout route, `NavLink`, `Outlet`, `*` | `src/router.tsx` + `src/layouts/RootLayout.tsx` | Clicking a link does **not** reload the page |
| 2 | Load the list in a loader | `src/pages/PeoplePage.tsx` + `src/router.tsx` | The list comes from `/api/people` |
| 3 | `/people/:id`: link, loader, page, "Back" | `src/pages/PersonPage.tsx` + `PeoplePage.tsx` + `src/router.tsx` | `/people/4` shows Darth Vader |
| 4 | The filter in `?q=` | `src/pages/PeoplePage.tsx` | A reload on `/?q=sky` keeps the filter |
| 5 | Error elements | `src/pages/ErrorPage.tsx` + `src/router.tsx` | `/people/999` shows "Not found" under the header |
| 6 | Lazy-load the person route | `src/router.tsx` | `npm run build` emits a `PersonPage-*.js` chunk |

## Steps

### 1. The layout — `src/router.tsx` + `src/layouts/RootLayout.tsx`

1. Turn the single route into a **layout route**: `path: '/'`,
   `Component: RootLayout`, with `children`. The people page is the **index**
   route, `create` renders `CreatePage` and `*` renders `NotFoundPage`.
   Child paths are relative: no leading `/`.
2. In `RootLayout`, replace the `<a>` with `<NavLink>`. Click one with the
   Network tab open: no document request any more. Try the `/` link without
   `end`, and see it stay active on every page.
3. Render `<Outlet />` inside `<main>`.

→ **Done when** the header stays on every page, the current link has
`aria-current="page"`, and `/starships/12` shows "Page not found" under the header.

### 2. A loader for the list — `src/pages/PeoplePage.tsx` + `src/router.tsx`

1. Export `peopleLoader({ request })`. For now it returns `fetchPeople('', request.signal)`.
   `request.signal` aborts the fetch when the user navigates away before it
   finishes.
2. Give the index route `loader: peopleLoader`, and the layout route
   `HydrateFallback: Loader`. That component shows while the loaders of the
   very first URL run. Without it, React Router warns.
3. In the page, `const people = useLoaderData<typeof peopleLoader>()`, and drop
   the import of `data/people`.

→ **Done when** the list comes from the API, and the page has no `useEffect` and
no `loading` state: the route renders only **after** its loader resolved.

### 3. The person route — `PersonPage.tsx`, `PeoplePage.tsx`, `router.tsx`

1. In the list, make each name a `<Link to={`people/${person.id}`}>`. It is a
   relative link, resolved against the current route.
2. In `PersonPage.tsx`, export `personLoader({ params, request })`. When
   `fetchPerson` gives `null`, **throw**
   `data(\`No person with id ${params.id}.\`, { status: 404 })`.
   Then render the page from `useLoaderData<typeof personLoader>()`, with a
   "Back" button calling `navigate(-1)`.
3. Register `people/:id` in the routes, with its loader.

→ **Done when** clicking Leia opens `/people/5`, and "Back" returns to the list.

### 4. URL state — `src/pages/PeoplePage.tsx`

A filter kept in `useState` is lost on reload, cannot be shared, and is gone
when you come back from a person. Put it in the URL.

1. Read `q` with `useSearchParams()`, and in the loader, from
   `new URL(request.url).searchParams`. Pass it to `fetchPeople`: the API filters.
2. On change, call `setSearchParams(value ? { q: value } : {}, { replace: true })`.
   With `replace`, a keystroke does not add a history entry, and "Back" still
   leaves the page.
3. Keep a **local state** for the input, initialised from `q`. `searchParams`
   only changes once the navigation is *done*, after the loader ran. An input
   bound straight to `q` lags behind the keyboard and drops letters. Try it to
   see the bug.

→ **Done when** typing `dar` gives `?q=dar` and Darth Vader alone, a reload keeps
it, and "Back" from a person restores the filtered list.

### 5. Errors — `src/pages/ErrorPage.tsx` + `src/router.tsx`

1. In `ErrorPage`, call `useRouteError()`. A thrown `data(…, { status })` passes
   `isRouteErrorResponse(error)`: show "Not found" for a 404 (`Error <status>`
   otherwise) and `error.data`, the message given to `data()`. Anything else is a bug or an outage:
   show "Something went wrong" and the error's message.
2. Wrap the children in a **pathless** route
   `{ ErrorBoundary: ErrorPage, children: [...] }`. It adds no URL segment.
   It puts an error boundary *inside* the layout, so a failing page keeps the
   header. Add `ErrorBoundary: ErrorPage` on the layout route as well, as a
   last resort.

→ **Done when** `/people/999` shows "Not found" with the header still there, and
a 500 from the API shows "Something went wrong".

### 6. A lazy route — `src/router.tsx`

Replace `Component` + `loader` on `people/:id` with the object form of `lazy`:

```tsx
lazy: {
  loader: async () => (await import('./pages/PersonPage')).personLoader,
  Component: async () => (await import('./pages/PersonPage')).PersonPage,
},
```

React Router downloads the chunk **and** runs the loader as part of the
navigation, so you do not need a `<Suspense>`. Both properties import the same
module, so Vite emits a single chunk. Remove the static import of `PersonPage`,
or Vite keeps it in the main bundle.

`src/tests/render.tsx` copies the routes for each test, and its comment says
why: a router *consumes* an object-form `lazy`.

→ **Done when** `npm run build` emits a `PersonPage-*.js` chunk, the Network tab
shows it downloading on the first click on a person, and the specs are still green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds and emits a `PersonPage-*.js` chunk
- [ ] `grep -rn TODO src` returns nothing
- [ ] No React Router warning in the browser console during a full tour

**The behaviour is there**

- [ ] Navigating between pages never reloads the document
- [ ] The active link is highlighted, and "People" is not active on `/create`
- [ ] `/people/4` opens Darth Vader directly, a reload included
- [ ] `/?q=sky` keeps its filter on reload, and "Back" from a person restores it
- [ ] `/people/999` and `/nowhere` both show an error page under the header

**You can explain**

- [ ] Why a loader beats a `useEffect` + `useState` fetch: what it changes for the
      loading state, for race conditions and for the URL
- [ ] Why the 404 is **thrown** and not returned
- [ ] What the pathless route adds, and what the root `ErrorBoundary` is still for
- [ ] Why the filter input needs its own state

## Going further

- Show a global "Loading…" bar in the layout with `useNavigation().state`,
  and dim the outlet while a loader runs.
- Replace the filter `<input>` and `setSearchParams` with a `<Form method="get">`
  from React Router. What does the browser do for you, and what still needs
  JavaScript?
- Return the promise *without awaiting it* from the person loader, and render it
  with `<Suspense>` + `<Await>`: the page shows at once and the details stream in.
- Add an `action` to the `create` route (chapter 16 does the form). After the
  POST, `redirect('/people/<new id>')`. The list loader revalidates on its own.
