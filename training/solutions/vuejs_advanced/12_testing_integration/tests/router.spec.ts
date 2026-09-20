import { describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSessionStore } from '@/stores/session';
import { session } from './fixtures';
import { flushPromises, freshRouter, mountApp } from './helpers';

/**
 * The router, for real: `createMemoryHistory()` gives the actual guard, the
 * actual navigation and the actual redirect, with no browser URL to reset
 * between tests. It is the version that would have caught a guard returning the
 * wrong route name — a mocked `useRouter()` never runs the guard at all.
 */

describe('the auth guard', () => {
  it('sends a signed-out visitor to the login page, remembering where they were going', async () => {
    const { router } = freshRouter();

    await router.push('/tickets/2');

    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/tickets/2');
  });

  it('lets a signed-in agent through', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useSessionStore().session = session;

    const { router } = freshRouter(pinia);
    await router.push('/tickets');

    expect(router.currentRoute.value.name).toBe('tickets');
  });
});

describe('signing in', () => {
  it('lands on the queue once the credentials are accepted', async () => {
    using app = await mountApp('/login');

    await app.wrapper.get('[data-testid="email"]').setValue('ada@acme.dev');
    await app.wrapper.get('[data-testid="password"]').setValue('secret');
    await app.wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(app.router.currentRoute.value.name).toBe('tickets');
  });

  it('stays on the login page when they are not', async () => {
    using app = await mountApp('/login');

    await app.wrapper.get('[data-testid="email"]').setValue('ada@acme.dev');
    await app.wrapper.get('[data-testid="password"]').setValue('nope');
    await app.wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(app.router.currentRoute.value.name).toBe('login');
    expect(app.wrapper.get('[data-testid="login-error"]').text()).toContain('do not match');
  });
});
