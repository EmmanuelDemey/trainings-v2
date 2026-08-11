import { reactive } from 'vue';
import type { PiniaPluginContext } from 'pinia';

/** Displayed by `ActionLogPanel.vue`. */
export const actionLog = reactive<Array<{ store: string; name: string; durationMs: number; failed: boolean }>>([]);

/**
 * STEP 6 — An observability plugin.
 *
 * TODO 6.1: use `store.$onAction(({ name, args, after, onError }) => ...)` to
 *   measure how long every action takes, and push an entry into `actionLog`.
 *   Both `after` and `onError` must record — a failed action still took time.
 *
 * TODO 6.2: also subscribe with `store.$subscribe` and log the `mutation.type`
 *   (`direct`, `patch object`, `patch function`). Then change `addToCart` to use
 *   `$patch` and watch the type change.
 *
 * TODO 6.3 (bonus): expose the log ON the store by returning
 *   `{ $actionLog: actionLog }` from the plugin, and type it in `pinia.d.ts`.
 */
export function loggerPlugin(context: PiniaPluginContext): void {
  void context;
  // TODO 6.1 → 6.2
}
