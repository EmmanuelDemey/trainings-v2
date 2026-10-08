import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { mountNetworkPanel } from './api/networkPanel';
import { App } from './App';
import './style.css';

// TODO (step 1): create the client ONCE, here, with `createQueryClient()` from
// './queryClient' — then wrap <App /> in a <QueryClientProvider client={…}>, and
// add <ReactQueryDevtools buttonPosition="top-right" /> inside the provider.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

mountNetworkPanel();
