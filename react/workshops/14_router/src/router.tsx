import type { RouteObject } from 'react-router';
import { PeoplePage } from './pages/PeoplePage';

// The routes alone, exported: `main.tsx` gives them to `createBrowserRouter`,
// the specs to `createMemoryRouter`. Same tree, different history.
export const routes: RouteObject[] = [
  // TODO 1.1: make this route the LAYOUT: `path: '/'`, `Component: RootLayout`
  //   (from './layouts/RootLayout'), and nest the pages as its `children`:
  //   - the people page as the index route: `{ index: true, Component: PeoplePage }`
  //   - `create` → CreatePage (from './pages/CreatePage')
  //   - `*`      → NotFoundPage (from './pages/NotFoundPage')
  //
  // TODO 2.1: give the index route `loader: peopleLoader`, and the layout route
  //   `HydrateFallback: Loader` (from './components/Loader').
  //
  // TODO 3.3: add `people/:id` → `Component: PersonPage`, `loader: personLoader`.
  //
  // TODO 5.2: put the children in a PATHLESS route `{ ErrorBoundary: ErrorPage,
  //   children: [...] }`, and add `ErrorBoundary: ErrorPage` to the layout too.
  //
  // TODO 6.1: turn the person route into a lazy route, object form:
  //   `lazy: { loader: async () => …, Component: async () => … }`.
  { path: '/', Component: PeoplePage },
];
