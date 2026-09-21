import type { App, Plugin } from 'vue';
import type { ToastOptions } from './types';

/**
 * The plugin, as a **factory**. `createRouter`, `createPinia` and `createI18n`
 * all converged on this shape, for one reason: the state belongs to the app that
 * installed it, never to this module.
 *
 * Already done for you: `createToastQueue()` in `queue.ts` — `notify`, `dismiss`
 * by id, the `max`, and each toast's own auto-dismiss timer.
 *
 * TODO 1: resolve the options **once**, here, with defaults —
 *   `position = 'top-right'`, `duration = 4000`, `max = 3`. Not on every call.
 *   Then create the queue **in this closure** — not at module scope — and build
 *   the `ToastApi` on top of it:
 *   - `toasts` — a `computed` read-only view, so a consumer cannot push
 *   - `position`, and the queue's `notify`, `dismiss` and `clear`
 *   Finally, in `install`: `app.provide(toastKey, api)`.
 *
 * TODO 2: in `install`, register `ToastHost` as a **global component** so a
 *   consumer never imports it. Then declare it in `augmentations.d.ts`.
 *
 * TODO 3: in `install`, expose `notify` as the `$toast` global property — the
 *   one exception worth spending, because it is typed in templates all day. Then
 *   declare it in `augmentations.d.ts`.
 */
export function createToast(options: ToastOptions = {}): Plugin {
  return {
    install(_app: App): void {},
  };
}

export { useToast } from './useToast';
export { toastKey } from './types';
export type { Toast, ToastApi, ToastLevel, ToastOptions, ToastPosition } from './types';
