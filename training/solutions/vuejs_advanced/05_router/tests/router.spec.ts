import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ADMIN_TOKEN, USER_TOKEN, freshRouter } from './helpers';

/**
 * The executable half of steps 3, 4, 5 and 6.
 *
 * These specs are given: they are the guard contract the README describes,
 * written down. They are red on the skeleton. Keep them running while you fill
 * in `src/router/index.ts` and `src/views/LoginView.vue`:
 *
 *   npm run test:watch
 *
 * What they do NOT cover is as deliberate as what they do: transitions, the
 * scroll position itself and the dirty-form confirm need a real browser — jsdom
 * has no layout engine and no scrolling. Those stay in the Definition of Done as
 * things you check by hand.
 */
describe('the navigation guard', () => {
  it('sends a signed-out visitor to /login and remembers where they were going', async () => {
    const { router } = await freshRouter();

    await router.push('/invoices');

    expect(router.currentRoute.value.name).toBe('login');
    // `to.fullPath`, not `to.path`: the query and the hash are part of the
    // destination the user asked for.
    expect(router.currentRoute.value.query.redirect).toBe('/invoices');
  });

  it('keeps a signed-in user on a protected page across a cold start', async () => {
    // No component has run yet and the store is empty — only the token survives.
    // This is a hard refresh on /invoices, and it is why `restoreSession()` has
    // to run inside the guard, before the auth check.
    const { router } = await freshRouter(ADMIN_TOKEN);

    await router.push('/invoices');

    expect(router.currentRoute.value.name).toBe('invoices');
  });

  it('bounces an authenticated user away from /login', async () => {
    const { router } = await freshRouter(ADMIN_TOKEN);

    await router.push('/login');

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('sends a user without the admin role to /forbidden', async () => {
    const { router } = await freshRouter(USER_TOKEN);

    await router.push('/admin');

    // 403, not 404 and not /login: they ARE signed in, they simply may not enter.
    expect(router.currentRoute.value.name).toBe('forbidden');
  });

  it('lets an admin into /admin', async () => {
    const { router } = await freshRouter(ADMIN_TOKEN);

    await router.push('/admin');

    expect(router.currentRoute.value.name).toBe('admin');
  });

  it('sets the document title on every navigation', async () => {
    const { router } = await freshRouter(ADMIN_TOKEN);

    await router.push('/invoices');
    expect(document.title).toBe('Invoices — TP 5');

    await router.push('/');
    expect(document.title).toBe('Home — TP 5');
  });
});

describe('the ?redirect query', () => {
  async function signIn(redirect: string) {
    const { router, pinia } = await freshRouter();
    await router.push(`/login?redirect=${redirect}`);

    const LoginView = (await import('@/views/LoginView.vue')).default;
    const wrapper = mount(LoginView, { global: { plugins: [router, pinia] } });
    await wrapper.get('form').trigger('submit');

    return { router, wrapper };
  }

  it('honours a legitimate path', async () => {
    const { router, wrapper } = await signIn('/invoices');

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('invoices'), {
      timeout: 3000,
    });
    expect(router.currentRoute.value.fullPath).toBe('/invoices');

    wrapper.unmount();
  });

  it('refuses an absolute URL to another origin', async () => {
    const { router, wrapper } = await signIn('https://example.com');

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('home'), {
      timeout: 3000,
    });

    wrapper.unmount();
  });

  it('refuses a protocol-relative URL', async () => {
    // `//example.com` starts with a slash and passes every "does it start with /"
    // review — and the browser reads it as `https://example.com`. This is the
    // case that turns a naive check into an open redirect.
    const { router, wrapper } = await signIn('//example.com');

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('home'), {
      timeout: 3000,
    });
    expect(router.currentRoute.value.fullPath).not.toContain('example.com');

    wrapper.unmount();
  });
});

/**
 * `scrollBehavior` is a pure function of its arguments, so it can be called
 * directly — no browser needed. jsdom cannot scroll, so this is the only
 * honest way to test it: the DECISION is asserted here, the actual scrolling
 * stays a manual check on the long /invoices page.
 */
describe('scrollBehavior', () => {
  type ScrollFn = (
    to: { path: string; hash: string },
    from: unknown,
    savedPosition: { left: number; top: number } | null,
  ) => unknown;

  async function scrollBehavior(): Promise<ScrollFn> {
    const { router } = await freshRouter();
    const fn = router.options.scrollBehavior as unknown as ScrollFn | undefined;
    expect(fn, 'router.options.scrollBehavior is not implemented yet').toBeTypeOf('function');
    return fn as ScrollFn;
  }

  it('restores the saved position on back and forward', async () => {
    const fn = await scrollBehavior();

    expect(fn({ path: '/invoices', hash: '' }, null, { left: 0, top: 420 })).toEqual({
      left: 0,
      top: 420,
    });
  });

  it('scrolls to the anchor when the target has a hash', async () => {
    const fn = await scrollBehavior();

    expect(fn({ path: '/invoices', hash: '#bottom' }, null, null)).toMatchObject({
      el: '#bottom',
      top: 80,
    });
  });

  it('starts a brand-new route at the top', async () => {
    const fn = await scrollBehavior();

    expect(fn({ path: '/admin', hash: '' }, null, null)).toEqual({ top: 0 });
  });
});
