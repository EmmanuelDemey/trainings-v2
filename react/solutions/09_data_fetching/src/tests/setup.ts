import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
// `toBeInTheDocument()`, `toHaveValue()`, … on Vitest's `expect`.
import '@testing-library/jest-dom/vitest';
import { server } from '../mocks/server';

// MSW intercepts at the network layer: the components keep calling the real
// `fetch`. `onUnhandledFrame: 'error'` (MSW 3 — it was `onUnhandledRequest` in v2) turns a request no handler knows into
// an explicit failure instead of a confusing timeout.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  // React Testing Library unmounts what it rendered after each test on its own
  // only when Vitest runs with `globals: true`. Without globals, it is done here.
  cleanup();
  // A `server.use()` override in one test must not leak into the next.
  server.resetHandlers();
});

afterAll(() => server.close());
