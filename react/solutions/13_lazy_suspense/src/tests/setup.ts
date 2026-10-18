import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
// `toBeInTheDocument()`, `toHaveValue()`, … on Vitest's `expect`.
import '@testing-library/jest-dom/vitest';
import { server } from '../mocks/server';

// Any request without a handler is a bug in the spec or in the app: fail loudly.
// (MSW 3 calls it a "frame" — an HTTP request or a WebSocket connection.)
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

// React Testing Library unmounts what it rendered after each test on its own
// only when Vitest runs with `globals: true`. Without globals, it is done here.
// `resetHandlers` drops the `server.use(...)` overrides a test added, and the
// listeners a test put on `server.events` go with it.
afterEach(() => {
  cleanup();
  server.resetHandlers();
  server.events.removeAllListeners();
});

afterAll(() => server.close());
