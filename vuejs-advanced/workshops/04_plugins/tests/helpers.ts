import { createApp } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import App from '@/App.vue';
import { createToast, useToast, type ToastApi, type ToastOptions } from '@/plugins/toast';

export interface MountedApp extends Disposable {
  wrapper: VueWrapper;
}

/** The demo app, with the plugin installed the way `main.ts` installs it. */
export function mountApp(options?: ToastOptions): MountedApp {
  const wrapper = mount(App, { global: { plugins: [createToast(options)] } });
  return { wrapper, [Symbol.dispose]: () => wrapper.unmount() };
}

export interface ToastContext extends Disposable {
  api: ToastApi;
}

/**
 * A bare app with the plugin installed, for the assertions that are about the
 * plugin itself rather than about the UI — "does each app get its own state?".
 */
export function withToast(options?: ToastOptions): ToastContext {
  let api!: ToastApi;

  const app = createApp({
    setup() {
      api = useToast();
      return () => null;
    },
  });
  app.use(createToast(options));
  app.mount(document.createElement('div'));

  return { api, [Symbol.dispose]: () => app.unmount() };
}
