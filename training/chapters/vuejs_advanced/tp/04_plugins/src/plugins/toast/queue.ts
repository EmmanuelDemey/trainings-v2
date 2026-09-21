import { ref, type Ref } from 'vue';
import type { Toast, ToastLevel } from './types';

/**
 * Already done for you: the toast bookkeeping itself — nothing plugin-specific
 * in here. The workshop is about where this queue is created, not about how it
 * counts.
 */
export interface ToastQueue {
  /** The live list. Writable: hand consumers a read-only view of it. */
  toasts: Ref<Toast[]>;
  notify(message: string, level?: ToastLevel): number;
  dismiss(id: number): void;
  clear(): void;
}

/**
 * A fresh queue, with its own list, its own timers and its own id counter.
 * Call it once per app — at module scope, every app would share one.
 */
export function createToastQueue(duration: number, max: number): ToastQueue {
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

    // Past `max`, the oldest goes — its timer included.
    while (toasts.value.length > max) {
      const oldest = toasts.value[0]!;
      dismiss(oldest.id);
    }

    // Each toast on its own clock. The handle stays in the Map so `dismiss()`
    // can cancel it, and nothing ever fires on a toast that is already gone.
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

  return { toasts, notify, dismiss, clear };
}
