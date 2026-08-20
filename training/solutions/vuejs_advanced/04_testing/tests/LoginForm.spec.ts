import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginForm from '@/components/LoginForm.vue';
import { makeRouter } from './helpers';

/**
 * STEP 2 — The same component, tested two ways.
 *
 * (A) here, with a REAL memory-history router. (B) in
 * `LoginForm.mockedRouter.spec.ts`, with `vi.mock('vue-router')`.
 *
 * Which one to keep? (A). It costs a few milliseconds and it exercises the
 * things that actually break in production: the query parsing, the redirect
 * validation, the final URL. (B) only proves that `replace` was called with a
 * string we computed ourselves — if `safeRedirect` is wrong, (B) asserts the
 * wrong value just as confidently. Reach for (B) when the router is incidental
 * to what you are testing, not when the navigation IS the behaviour.
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
    const submit = wrapper.get('[data-testid="submit"]');

    expect(submit.attributes('disabled')).toBeDefined();

    // `setValue` must be awaited: it triggers the input event, and the computed
    // only re-evaluates on the next tick.
    await wrapper.get('[data-testid="email"]').setValue('ada@example.com');
    await wrapper.get('[data-testid="password"]').setValue('secret');

    expect(submit.attributes('disabled')).toBeUndefined();
  });

  it('redirects to the `redirect` query parameter after a successful login', async () => {
    const router = makeRouter();
    router.push('/login?redirect=/admin');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    await wrapper.get('[data-testid="email"]').setValue('ada@example.com');
    await wrapper.get('[data-testid="password"]').setValue('secret');
    await wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/admin');
  });

  it('ignores an absolute redirect and falls back to /invoices', async () => {
    const router = makeRouter();
    router.push('/login?redirect=https://evil.example.com');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    await wrapper.get('[data-testid="email"]').setValue('ada@example.com');
    await wrapper.get('[data-testid="password"]').setValue('secret');
    await wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/invoices');
  });

  /**
   * The PROTOCOL-RELATIVE form, and the reason the regex is `/^\/(?!\/)/` rather
   * than `/^\//`. `//evil.example.com` starts with a slash, so a naive check
   * accepts it — and the browser reads it as `https://evil.example.com`. An open
   * redirect that survives every "does it start with a slash?" review.
   *
   * Sabotage check: relax the regex to `/^\//` and THIS is the test that must go
   * red. If only the `https://` one fails, the case the regex exists for is not
   * covered.
   */
  it('ignores a protocol-relative redirect', async () => {
    const router = makeRouter();
    router.push('/login?redirect=//evil.example.com');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    await wrapper.get('[data-testid="email"]').setValue('ada@example.com');
    await wrapper.get('[data-testid="password"]').setValue('secret');
    await wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/invoices');
  });

  it('displays an error when the credentials are rejected', async () => {
    const router = makeRouter();
    router.push('/login');
    await router.isReady();

    const wrapper = mount(LoginForm, { global: { plugins: [router] } });

    // The MSW handler answers 401 for anything that is not ada/secret.
    await wrapper.get('[data-testid="email"]').setValue('ada@example.com');
    await wrapper.get('[data-testid="password"]').setValue('wrong');
    await wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    const alert = wrapper.find('[data-testid="login-error"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('401');
    expect(router.currentRoute.value.path).toBe('/login'); // and we did NOT navigate
  });
});
