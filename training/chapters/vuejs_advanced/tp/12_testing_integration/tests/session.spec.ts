import { describe, it } from 'vitest';

/**
 * STEP 2 — driving a component through its store, with `createTestingPinia`.
 *
 *   import { createTestingPinia } from '@pinia/testing';
 *
 *   const pinia = createTestingPinia({
 *     createSpy: vi.fn,                       // required with Vitest
 *     initialState: { session: { session } }, // keyed by store id
 *   });
 *
 * TODO 2a: `SessionBadge` shows the agent's name when the store says there is a
 *   session, and "Not signed in" when there is not. Drive it with `initialState`
 *   alone — no network, no login form.
 *
 * TODO 2b: clicking "Sign out" calls `signOut`. With `createTestingPinia` every
 *   action is **stubbed and spied** by default, so assert on the spy — and
 *   notice the state does NOT change, because the real action never ran.
 *
 * TODO 2c: pass `stubActions: false` and watch the same test behave differently:
 *   the real action runs, the state changes, and the spy still records the call.
 *   Say which of the two you want here, and why.
 *
 * TODO 2d: `LoginView` calls `session.signIn(email, password)` on submit. Assert
 *   the call and its arguments — that is the component's contract with the
 *   store, and it does not need a network.
 */

describe('SessionBadge', () => {
  it.todo('shows the signed-in agent');
  it.todo('shows an anonymous badge when there is no session');
  it.todo('asks the store to sign out');
});

describe('LoginView', () => {
  it.todo('hands the credentials to the store, exactly as typed');
});
