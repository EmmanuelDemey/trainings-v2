import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
// `toBeInTheDocument()`, `toHaveValue()`, … on Vitest's `expect`.
import '@testing-library/jest-dom/vitest';
import { resetDb } from '../mocks/handlers';
import { server } from '../mocks/node';

// A request no handler answers is a bug in the test or in the app: fail loudly.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

// React Testing Library unmounts what it rendered after each test on its own
// only when Vitest runs with `globals: true`. Without globals, it is done here.
afterEach(() => {
  cleanup();
  // Drops the `server.use()` overrides of the test, and the people it created.
  server.resetHandlers();
  resetDb();
});

afterAll(() => server.close());
