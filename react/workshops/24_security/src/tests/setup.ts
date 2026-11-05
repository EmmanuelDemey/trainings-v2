import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
// `toBeInTheDocument()`, `toHaveValue()`, … on Vitest's `expect`.
import '@testing-library/jest-dom/vitest';
import { clearSession } from '../auth/session';
import { resetMockSessions } from '../mocks/handlers';
import { server } from '../mocks/server';

// Any request without a handler is a bug in the spec or in the app: fail loudly.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

// React Testing Library unmounts what it rendered after each test on its own
// only when Vitest runs with `globals: true`. Without globals, it is done here.
// Each test also starts logged out, on both sides: the token in memory, and the
// refresh session of the fake API.
afterEach(() => {
  cleanup();
  server.resetHandlers();
  server.events.removeAllListeners();
  clearSession();
  resetMockSessions();
  window.localStorage.clear();
});

afterAll(() => server.close());
