import type { App, Plugin } from 'vue';
import type { ToastOptions } from './types';

/**
 * The plugin, as a **factory**. `createRouter`, `createPinia` and `createI18n`
 * all converged on this shape, for one reason: the state belongs to the app that
 * installed it, never to this module.
 *
 * TODO 1: resolve the options **once**, here, with defaults —
 *   `position = 'top-right'`, `duration = 4000`, `max = 3`. Not on every call.
 *
 * TODO 2: hold the state in this closure: a `ref<Toast[]>`, a `Map` of pending
 *   timers, and an id counter. Build the `ToastApi`:
 *   - `toasts` — a `computed` read-only view, so a consumer cannot push
 *   - `notify(message, level = 'info')` — appends a toast, returns its id
 *   - `dismiss(id)` — removes it AND clears its pending timer
 *   - `clear()` — removes every toast and every timer
 *
 * TODO 3: past `max` toasts on screen, drop the **oldest** — timer included.
 *
 * TODO 4: each toast dismisses itself after `duration` ms. Keep the handle in
 *   the `Map`, so `dismiss()` can cancel it and nothing fires on a toast that is
 *   already gone.
 *
 * TODO 5: in `install`, (a) `app.provide(toastKey, api)`, (b) register
 *   `ToastHost` as a **global component** so a consumer never imports it, and
 *   (c) expose `notify` as the `$toast` global property — the one exception
 *   worth spending, because it is typed in templates all day. Then declare it in
 *   `globalProperties.d.ts`.
 */
export function createToast(options: ToastOptions = {}): Plugin {
  return {
    install(_app: App): void {},
  };
}

export { useToast } from './useToast';
export { toastKey } from './types';
export type { Toast, ToastApi, ToastLevel, ToastOptions, ToastPosition } from './types';
