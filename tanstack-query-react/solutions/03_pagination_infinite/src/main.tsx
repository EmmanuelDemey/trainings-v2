import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { mountNetworkPanel } from './api/networkPanel';
import { App } from './App';
import { createQueryClient } from './queryClient';
import './style.css';

// Created ONCE, outside any component: a client created during a render would
// be a new, empty cache at every render.
const queryClient = createQueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Left out of the production build on its own (`process.env.NODE_ENV`).
          Top-right, so the Network panel at the bottom does not hide it. */}
      <ReactQueryDevtools buttonPosition="top-right" />
    </QueryClientProvider>
  </StrictMode>,
);

mountNetworkPanel();
