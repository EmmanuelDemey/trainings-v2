import { createBrowserRouter, data, type RouteObject } from 'react-router';
import { CreatePersonPage, createPersonAction } from './pages/CreatePersonPage';
import { ErrorPage } from './pages/ErrorPage';
import { Layout } from './pages/Layout';
import { PeoplePage, peopleLoader } from './pages/PeoplePage';
import { PersonPage, personLoader } from './pages/PersonPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    // What renders while the loaders of the very first page run.
    HydrateFallback: () => <p role="status">Loading…</p>,
    children: [
      {
        // A pathless layout route: the error page renders INSIDE the layout,
        // so the header and the navigation survive an error.
        ErrorBoundary: ErrorPage,
        children: [
          {
            index: true,
            Component: PeoplePage,
            loader: peopleLoader,
            // Typing in the filter only changes `?q=`: the list is filtered in
            // the browser, so do not fetch it again on every keystroke. Anything
            // else (a form submission, another page) keeps the default.
            shouldRevalidate: ({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }) =>
              formMethod === undefined && currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate,
          },
          { path: 'people/:id', Component: PersonPage, loader: personLoader },
          { path: 'create', Component: CreatePersonPage, action: createPersonAction },
          {
            path: '*',
            loader: () => {
              throw data('This page does not exist.', { status: 404 });
            },
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
