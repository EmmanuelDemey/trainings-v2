import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { routes } from '../router';

/**
 * A fresh copy of the route tree for each router. An object-form `lazy` is
 * consumed by the router that resolves it — React Router deletes each property
 * from the object once loaded — so a second router built from the SAME objects
 * would find an empty `lazy: {}`. In the browser there is one router per page
 * load; the specs build one per test.
 */
function copyRoutes(tree: RouteObject[]): RouteObject[] {
  return tree.map((route) => {
    const copy = { ...route } as RouteObject;
    if (route.lazy && typeof route.lazy === 'object') copy.lazy = { ...route.lazy };
    if (route.children) copy.children = copyRoutes(route.children);
    return copy;
  });
}

/**
 * Renders the app's real route tree at `path`, in memory: no browser URL bar,
 * but the same loaders, links and error elements. Returns the router, whose
 * `state.location` is the URL the app is on.
 */
export function renderAt(path: string) {
  const router = createMemoryRouter(copyRoutes(routes), { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}
