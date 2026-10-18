import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
// The DOM flavour of <RouterProvider>: it wires `flushSync` from react-dom, which
// view transitions need. In the specs, the one from 'react-router' is enough.
import { RouterProvider } from 'react-router/dom';
import { routes } from './router';
import './style.css';

// There is no real backend: in development, the MSW service worker answers the
// `/api` requests. It is loaded lazily, so it never reaches a production bundle.
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

// Started BEFORE the router is created: `createBrowserRouter` runs the loaders
// of the first URL at once, and their requests need the worker.
await enableMocking();

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
