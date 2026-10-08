import { createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { mount, RouterLinkStub, type VueWrapper } from '@vue/test-utils';
import type { Component } from 'vue';
import type { Router } from 'vue-router';
import App from '@/App.vue';
import { createAppRouter } from '@/router';

/**
 * A **real** router on a memory history: real guards, real navigation, no
 * browser URL to clean up between tests. Pinia has to be active first — the
 * guard calls `useSessionStore()`.
 */
export function freshRouter(pinia: Pinia = createPinia()): { router: Router; pinia: Pinia } {
  setActivePinia(pinia);
  return { router: createAppRouter(createMemoryHistory()), pinia };
}

export interface MountedApp extends Disposable {
  wrapper: VueWrapper;
  router: Router;
  pinia: Pinia;
}

/** The whole app, on a memory router, settled on `path`. */
export async function mountApp(path = '/', pinia: Pinia = createPinia()): Promise<MountedApp> {
  const { router } = freshRouter(pinia);
  await router.push(path);
  await router.isReady();

  const wrapper = mount(App, { global: { plugins: [pinia, router] } });

  return { wrapper, router, pinia, [Symbol.dispose]: () => wrapper.unmount() };
}

/**
 * One component, with `<RouterLink>` stubbed. Use it when the router is NOT what
 * is under test: a stub keeps the spec about the component.
 */
export function mountStandalone(component: Component, props?: Record<string, unknown>): VueWrapper {
  return mount(component, {
    props,
    global: { stubs: { RouterLink: RouterLinkStub } },
  });
}

/** Lets pending microtasks settle — `nextTick()` only flushes Vue's own queue. */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
