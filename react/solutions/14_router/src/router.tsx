import type { RouteObject } from 'react-router';
import { Loader } from './components/Loader';
import { RootLayout } from './layouts/RootLayout';
import { CreatePage } from './pages/CreatePage';
import { ErrorPage } from './pages/ErrorPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PeoplePage, peopleLoader } from './pages/PeoplePage';

// The routes alone, exported: `main.tsx` gives them to `createBrowserRouter`,
// the specs to `createMemoryRouter`. Same tree, different history.
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    // Last resort, if the layout itself breaks: it replaces the whole screen.
    ErrorBoundary: ErrorPage,
    // Shown while the loaders of the very first URL run.
    HydrateFallback: Loader,
    children: [
      {
        // A pathless route: it adds no URL segment, only an error boundary
        // INSIDE the layout — a failing page keeps the header and its links.
        ErrorBoundary: ErrorPage,
        children: [
          { index: true, Component: PeoplePage, loader: peopleLoader },
          {
            path: 'people/:id',
            // Code splitting at the route level: each property is loaded on the
            // first navigation to a person. React Router downloads the chunk
            // and runs the loader in one go — no <Suspense> needed. Both point
            // at the same module, so Vite emits a single chunk for them.
            lazy: {
              loader: async () => (await import('./pages/PersonPage')).personLoader,
              Component: async () => (await import('./pages/PersonPage')).PersonPage,
            },
          },
          { path: 'create', Component: CreatePage },
          // Matches anything the routes above did not.
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
];
