import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

async function enableMocking(): Promise<void> {
  // The fake API only exists in development: `vite build` drops this branch,
  // and MSW with it.
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

// TODO 1.2: create ONE client with `createQueryClient()`, outside any component,
//           and wrap <App /> in a <QueryClientProvider client={…}>.
// TODO 1.3: add <ReactQueryDevtools initialIsOpen={false} /> inside the provider.

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
