import { describe, it } from 'vitest';

/**
 * STEP 1 — the router, tested twice.
 *
 * `tests/helpers.ts` gives you `mountApp(path)` and `freshRouter()`: a **real**
 * router on `createMemoryHistory()`, with the real guard, and no browser URL to
 * reset between tests.
 *
 * TODO 1a: the guard. Visiting `/tickets` while signed out lands on `/login`,
 *   and `route.query.redirect` remembers where you were going. Signed in, the
 *   same navigation goes through.
 *   Hint: `freshRouter()` returns the pinia it activated — set the session store
 *   on it before pushing.
 *
 * TODO 1b: the round trip. From `/login`, signing in with the right credentials
 *   ends on the queue; `router.currentRoute.value.name` is what you assert.
 *
 * TODO 1c: the other way round is in `tests/loginView.mockedRouter.spec.ts` —
 *   `vi.mock` is hoisted for a whole module, so it cannot share a file with the
 *   real-router specs above.
 */

describe('the auth guard', () => {
  it.todo('sends a signed-out visitor to the login page, remembering where they were going');
  it.todo('lets a signed-in agent through');
});

describe('signing in', () => {
  it.todo('lands on the queue once the credentials are accepted');
  it.todo('stays on the login page when they are not');
});
