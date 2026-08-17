import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginForm from '@/components/LoginForm.vue';
import { makeRouter } from './helpers';

/**
 * STEP 2 (PART 2 — chapter 7) — The same component, tested two ways.
 *
 * A) with a REAL router (memory history): slower, but it exercises the actual
 *    navigation, the query parsing and the redirect validation.
 * B) with `vi.mock('vue-router')`: faster and more focused, but it only proves
 *    that `push` was called with the right argument.
 *
 * Write both, then decide which one you would keep in a real project — and be
 * able to justify it.
 */
describe('LoginForm — with a real router', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('keeps the submit button disabled until the form is valid', async () => {
    const router = makeRouter();
    router.push('/login');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    // TODO 2.1: assert the button is disabled, then fill both fields with valid
    //   values (`setValue`, awaited!) and assert it is enabled.
    expect(wrapper.exists()).toBe(true);
  });

  it('redirects to the `redirect` query parameter after a successful login', async () => {
    const router = makeRouter();
    router.push('/login?redirect=/admin');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    // TODO 2.2: fill in ada@example.com / secret (see `tests/msw.ts`), submit the
    //   form, `await flushPromises()`, and assert
    //   `router.currentRoute.value.path === '/admin'`.
    void wrapper;
    await flushPromises();
  });

  it('ignores an absolute redirect and falls back to /invoices', async () => {
    const router = makeRouter();
    router.push('/login?redirect=https://evil.example.com');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    // TODO 2.3: same flow, and assert we landed on '/invoices'.
    //   This test is the one that stops an open redirect from coming back.
    void wrapper;
  });

  it('displays an error when the credentials are rejected', async () => {
    const router = makeRouter();
    router.push('/login');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    // TODO 2.4: submit wrong credentials (the MSW handler answers 401) and
    //   assert `[data-testid="login-error"]` is rendered.
    void wrapper;
  });
});

/**
 * TODO 2.5: write the same "redirects after login" test in a second `describe`,
 * this time mocking the router:
 *
 *   vi.mock('vue-router', async (importOriginal) => ({
 *     ...(await importOriginal<typeof import('vue-router')>()),
 *     useRouter: vi.fn(),
 *     useRoute: vi.fn(() => ({ query: { redirect: '/admin' } })),
 *   }));
 *
 * Careful: `vi.mock` is HOISTED to the top of the file, so it cannot reference a
 * variable declared above it. Put it in its own spec file if that gets in the
 * way — which is itself a good reason to prefer approach (A).
 */
