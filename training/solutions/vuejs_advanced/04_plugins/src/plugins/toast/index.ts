import { computed, type App, type Plugin } from 'vue';
import ToastHost from './ToastHost.vue';
import { createToastQueue } from './queue';
import { toastKey, type ToastApi, type ToastOptions } from './types';

/**
 * The plugin, as a **factory**.
 *
 * Everything below lives in this closure, which is the point: `createToast()`
 * called twice returns two objects with two independent states, one per app. A
 * module-level `const queue = createToastQueue(...)` would have been shared by
 * every app in the process — including, in a test run, by every test.
 */
export function createToast(options: ToastOptions = {}): Plugin {
  // Resolved once, here. Not read again on every `notify()`.
  const { position = 'top-right', duration = 4000, max = 3 } = options;

  // Created HERE, inside the factory: one queue per `createToast()` call.
  const queue = createToastQueue(duration, max);

  const api: ToastApi = {
    // A `computed` hands out a read-only view: a consumer can read the list,
    // and has no way to push into it behind the plugin's back.
    toasts: computed(() => queue.toasts.value),
    position,
    notify: queue.notify,
    dismiss: queue.dismiss,
    clear: queue.clear,
  };

  return {
    install(app: App): void {
      app.provide(toastKey, api);
      app.component('ToastHost', ToastHost);
      // The one global property worth spending: it is typed in templates all
      // day, and `augmentations.d.ts` pays its price.
      app.config.globalProperties.$toast = queue.notify;
    },
  };
}

export { useToast } from './useToast';
export { toastKey } from './types';
export type { Toast, ToastApi, ToastLevel, ToastOptions, ToastPosition } from './types';
