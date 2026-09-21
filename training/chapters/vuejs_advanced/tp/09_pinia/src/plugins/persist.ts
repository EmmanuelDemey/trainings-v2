import type { PiniaPluginContext } from 'pinia';

/**
 * STEP 3 — A persistence plugin.
 *
 * Goal: `defineStore('cart', setup, { persist: true })` should be enough to save
 * and restore a store, with no code inside the store itself.
 *
 * TODO 3.1: bail out early when `options.persist` is falsy — a plugin runs for
 *   EVERY store, so opting in matters.
 *
 * TODO 3.2: on creation, read `localStorage` under `pinia:<store.$id>` and, if
 *   present, `store.$patch(JSON.parse(...))`. Guard the parse: a corrupted entry
 *   must not break the app.
 *
 * TODO 3.3: subscribe with `store.$subscribe` and write the state back on every
 *   mutation.
 *
 * TODO 3.4: type the custom option (see `src/plugins/pinia.d.ts`), then remove
 *   any `as never` / `as any` you needed to get here.
 */
export function persistPlugin(context: PiniaPluginContext): void {
  void context;
  // TODO 3.1 → 3.3
}
