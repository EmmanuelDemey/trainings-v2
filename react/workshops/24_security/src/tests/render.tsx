import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthProvider } from '../auth/AuthContext';
import { routes } from '../router';

/**
 * Renders the app's real route tree at `path`, in memory. Returns the router,
 * whose `state.location` is the URL the app is on.
 */
export function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}
