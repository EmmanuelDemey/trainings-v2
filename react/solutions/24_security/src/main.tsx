import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './auth/AuthContext';
import { routes } from './router';
import './style.css';

// There is no real backend: in development, the MSW service worker answers the
// `/api` requests. It is loaded lazily, so it never reaches a production bundle.
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

await enableMocking();

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
