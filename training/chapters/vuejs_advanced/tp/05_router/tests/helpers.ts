import { vi } from 'vitest';
import { createApp } from 'vue';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import type { Router } from 'vue-router';

/**
 * The key `useAuthStore` reads when it is created. The store does not export it,
 * so it is repeated here — and a test that seeds it must do so BEFORE the first
 * `useAuthStore()` call, because the token is read at store creation.
 */
export const TOKEN_KEY = 'tp4:token';

/** Ada Lovelace — `['admin', 'user']`. */
export const ADMIN_TOKEN = 'token-1';
/** Alan Turing — `['user']` only. */
export const USER_TOKEN = 'token-2';

export interface RouterContext {
  router: Router;
  pinia: Pinia;
}

/**
 * A fresh router and a fresh Pinia, for one test.
 *
 * `export const router` is module-level state: its history stack, its current
 * route and the `meta` of its shared route records all survive from one test to
 * the next. So the module registry is reset and the router rebuilt every time.
 *
 * Pass a token to start the test signed in — that is the "cold start" a real
 * user gets on a hard refresh, and the reason the guard has to call
 * `restoreSession()` before it checks anything.
 */
export async function freshRouter(token?: string): Promise<RouterContext> {
  vi.resetModules();

  localStorage.clear();
  if (token) localStorage.setItem(TOKEN_KEY, token);

  // jsdom keeps the URL between tests; the rebuilt router would otherwise start
  // wherever the previous test left off.
  window.history.replaceState({}, '', '/');
  document.title = '';

  // The guard calls `useAuthStore()` outside of any component, so an active
  // Pinia has to exist before the first navigation.
  const pinia = createPinia();
  const app = createApp({ render: () => null });
  app.use(pinia);
  setActivePinia(pinia);

  const { router } = await import('@/router');
  app.use(router);

  // Nothing has navigated yet, and `isReady()` only resolves once something has:
  // outside a mounted app, waiting for it without pushing first hangs for ever.
  await router.push('/');
  await router.isReady();

  return { router, pinia };
}
