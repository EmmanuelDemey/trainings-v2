import { describe, it } from 'vitest';

/**
 * STEP 3 — the network, mocked one layer lower: MSW.
 *
 * `tests/msw.ts` already serves the happy path, and `tests/setup.ts` starts the
 * server for the whole run and resets the overrides after each test. You add the
 * unhappy paths, per test:
 *
 *   server.use(http.get('/api/tickets', () => new HttpResponse(null, { status: 500 })));
 *
 * TODO 3a: the happy path. Mounting the app on `/tickets` (signed in) shows one
 *   row per ticket and the open count. Remember the request is asynchronous —
 *   `flushPromises()` from the helpers.
 *
 * TODO 3b: the empty queue. Override with an empty array and assert the empty
 *   state, not an empty table.
 *
 * TODO 3c: the failure. Override with a 500 and assert the error message — and
 *   that the previous tickets are gone rather than left on screen.
 *
 * TODO 3d: closing a ticket goes through the network too. Close one and assert
 *   the row's status changed.
 *
 * TODO 3e: take a handler away entirely and read the failure. `onUnhandledRequest:
 *   'error'` is what turns "the test hangs" into "you forgot a handler".
 */

describe('the queue', () => {
  it.todo('lists what the API returns');
  it.todo('says the queue is empty rather than rendering an empty table');
  it.todo('reports a failure instead of showing a stale list');
});

describe('closing a ticket', () => {
  it.todo('reflects the new status once the API confirms it');
});
