import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw';

// MSW intercepts at the network layer, so the same handlers work for `fetch`,
// axios or anything else. `onUnhandledRequest: 'error'` makes a forgotten
// handler an explicit failure rather than a confusing timeout.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
