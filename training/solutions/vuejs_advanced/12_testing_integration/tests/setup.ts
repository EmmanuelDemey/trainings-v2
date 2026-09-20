import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw';

// MSW intercepts at the network layer, so the same handlers cover `fetch`, axios
// or anything else. `onUnhandledRequest: 'error'` turns a forgotten handler into
// an explicit failure rather than a confusing timeout.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  // The session store persists to `localStorage`, which jsdom keeps for the
  // whole file. Without this, a test that signs in leaks into the next one.
  localStorage.clear();
});

afterAll(() => server.close());
