import { mount, type VueWrapper } from '@vue/test-utils';
import type { Router } from 'vue-router';
import App from '@/App.vue';
import { createAppRouter } from '@/router';

export interface MountedApp extends Disposable {
  wrapper: VueWrapper;
  router: Router;
}

/** Mounts the app on a router already settled on `path`. */
export async function mountAt(path: string): Promise<MountedApp> {
  const router = createAppRouter();
  await router.push(path);
  await router.isReady();

  const wrapper = mount(App, { global: { plugins: [router] } });

  return { wrapper, router, [Symbol.dispose]: () => wrapper.unmount() };
}
