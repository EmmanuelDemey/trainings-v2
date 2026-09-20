import { describe, it } from 'vitest';

/**
 * STEP 1c — the same view, with the router **mocked**.
 *
 * `LoginView` only ever calls `useRouter().push()` and reads `route.query`.
 * Building a real router for that is a lot of machinery for two function calls:
 *
 *   const push = vi.fn();
 *   vi.mock('vue-router', () => ({
 *     useRouter: () => ({ push }),
 *     useRoute: () => ({ query: { redirect: '/tickets/2' } }),
 *   }));
 *
 * `vi.mock` is hoisted to the top of the **module**, which is why this lives in
 * a file of its own: in `router.spec.ts` it would have swallowed the real router
 * too.
 *
 * TODO 1c: assert that a successful sign-in pushes to the redirect target.
 *   Then decide which of the two styles you would keep for this view, and write
 *   it in the Definition of Done. (Hint: what does the real-router version catch
 *   that this one cannot?)
 */

describe('LoginView, with a mocked router', () => {
  it.todo('pushes to the redirect target once the store accepts the credentials');
});
