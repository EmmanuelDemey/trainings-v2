import { reactive } from 'vue';
import type { PiniaPluginContext } from 'pinia';

/** Displayed by `ActionLogPanel.vue`. */
export const actionLog = reactive<
  Array<{ store: string; name: string; durationMs: number; failed: boolean }>
>([]);

/**
 * STEP 6 — An observability plugin.
 *
 * Fifteen lines here replace a `console.time` in every action of every store —
 * and, unlike those, they cannot be forgotten in the one action that turns out
 * to be slow.
 */
export function loggerPlugin({ store }: PiniaPluginContext): { $actionLog: typeof actionLog } {
  store.$onAction(({ name, after, onError }) => {
    const start = performance.now();

    const record = (failed: boolean): void => {
      actionLog.push({
        store: store.$id,
        name,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        failed,
      });
    };

    // `after` fires when the action returns — and, for an async action, when
    // its promise RESOLVES. That is what makes this a real measurement rather
    // than a timing of the synchronous prelude.
    after(() => record(false));

    // Both hooks are needed. A failed action still took time, and it is usually
    // the one you wanted to see: without `onError`, a store that throws on
    // every call produces an empty log.
    onError(() => record(true));
  });

  store.$subscribe((mutation) => {
    // 'direct' — `store.x = 1` or a ref assignment inside an action
    // 'patch object' — `store.$patch({ x: 1 })`
    // 'patch function' — `store.$patch((state) => { ... })`
    // `addToCart` uses the third form, so it shows up as 'patch function'.
    console.debug(`[pinia] ${mutation.storeId}: ${mutation.type}`);
  });

  // Whatever a plugin returns is merged onto every store instance — typed in
  // `pinia.d.ts` so `store.$actionLog` is not `any` at the call site.
  return { $actionLog: actionLog };
}
