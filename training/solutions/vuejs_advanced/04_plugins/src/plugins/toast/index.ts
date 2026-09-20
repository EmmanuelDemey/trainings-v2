import { computed, ref, type App, type Plugin } from 'vue';
import ToastHost from './ToastHost.vue';
import { toastKey, type Toast, type ToastApi, type ToastLevel, type ToastOptions } from './types';

/**
 * The plugin, as a **factory**.
 *
 * Everything below lives in this closure, which is the point: `createToast()`
 * called twice returns two objects with two independent states, one per app. A
 * module-level `const toasts = ref([])` would have been shared by every app in
 * the process — including, in a test run, by every test.
 */
export function createToast(options: ToastOptions = {}): Plugin {
  // Resolved once, here. Not read again on every `notify()`.
  const { position = 'top-right', duration = 4000, max = 3 } = options;

  const toasts = ref<Toast[]>([]);
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  let nextId = 1;

  function forget(id: number): void {
    const timer = timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }

  function dismiss(id: number): void {
    forget(id);
    // By id, never by index: a toast that expires while another is dismissed
    // would otherwise take its neighbour with it.
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function notify(message: string, level: ToastLevel = 'info'): number {
    const id = nextId++;
    toasts.value = [...toasts.value, { id, message, level }];

    while (toasts.value.length > max) {
      const oldest = toasts.value[0]!;
      dismiss(oldest.id);
    }

    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    );

    return id;
  }

  function clear(): void {
    for (const id of [...timers.keys()]) forget(id);
    toasts.value = [];
  }

  const api: ToastApi = {
    // A `computed` hands out a read-only view: a consumer can read the list,
    // and has no way to push into it behind the plugin's back.
    toasts: computed(() => toasts.value),
    position,
    notify,
    dismiss,
    clear,
  };

  return {
    install(app: App): void {
      app.provide(toastKey, api);
      app.component('ToastHost', ToastHost);
      // The one global property worth spending: it is typed in templates all
      // day, and `augmentations.d.ts` pays its price.
      app.config.globalProperties.$toast = notify;
    },
  };
}

export { useToast } from './useToast';
export { toastKey } from './types';
export type { Toast, ToastApi, ToastLevel, ToastOptions, ToastPosition } from './types';
