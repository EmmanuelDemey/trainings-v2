import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App } from './App';
import { createQueryClient } from './queryClient';
import './style.css';

async function enableMocking(): Promise<void> {
  // The fake API only exists in development: `vite build` drops this branch,
  // and MSW with it.
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

// ONE client for the whole app, created once — outside any component, or a
// re-render would create a new, empty cache.
const queryClient = createQueryClient();

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* The flower in the bottom corner: every key, its state, its data. Left out of the production build. */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
