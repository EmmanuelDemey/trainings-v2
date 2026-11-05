import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installFakeServer } from './api/fakeServer';
import { App } from './App';
import { initSentry, rootOptions } from './sentry';
import './style.css';

// The fake backend first: the SDK's fetch instrumentation then wraps it, as it
// wraps the real `fetch` in production.
installFakeServer();
initSentry();

createRoot(document.getElementById('root')!, rootOptions).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
