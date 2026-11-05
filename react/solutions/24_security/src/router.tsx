import type { RouteObject } from 'react-router';
import { Loader } from './components/Loader';
import { RootLayout } from './layouts/RootLayout';
import { AdminPage, adminLoader } from './pages/AdminPage';
import { ErrorPage } from './pages/ErrorPage';
import { LoginPage } from './pages/LoginPage';
import { PeoplePage, peopleLoader } from './pages/PeoplePage';
import { PersonPage, personLoader } from './pages/PersonPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: ErrorPage,
    HydrateFallback: Loader,
    children: [
      {
        ErrorBoundary: ErrorPage,
        children: [
          // Public.
          { path: 'login', Component: LoginPage },
          // Protected: each loader starts with `requireUser` / `requireRole`.
          // A loader runs BEFORE the page renders — not a single protected
          // pixel, nor a single protected request, for an anonymous visitor.
          { index: true, Component: PeoplePage, loader: peopleLoader },
          { path: 'people/:id', Component: PersonPage, loader: personLoader },
          { path: 'admin', Component: AdminPage, loader: adminLoader },
        ],
      },
    ],
  },
];
