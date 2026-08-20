import type { PiniaPluginContext, StateTree } from 'pinia';

const PREFIX = 'pinia:';

/**
 * STEP 4 — A persistence plugin.
 *
 * `defineStore('cart', setup, { persist: true })` is enough to save and restore
 * a store, with no code inside the store itself. That is the point of a plugin:
 * a cross-cutting concern that would otherwise be copy-pasted into every store.
 */
export function persistPlugin({ store, options }: PiniaPluginContext): void {
  const config = options.persist;

  // A plugin runs for EVERY store, including the ones that hold a 30 000-item
  // catalog. Opting in is not a nicety — persisting the catalog would blow past
  // localStorage's 5 MB quota and throw on the first write.
  if (!config) return;

  const key = `${PREFIX}${store.$id}`;
  const paths = typeof config === 'object' ? config.paths : null;

  /** Keeps only the whitelisted top-level keys, when there is a whitelist. */
  function pick(state: StateTree): StateTree {
    if (!paths) return state;
    return Object.fromEntries(paths.filter((path) => path in state).map((path) => [path, state[path]]));
  }

  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      // `$patch` and not `$state =`: patching MERGES, so a store that gained a
      // new field since the entry was written keeps that field's default
      // instead of coming back `undefined`.
      store.$patch(pick(JSON.parse(stored) as StateTree));
    } catch {
      // localStorage is user-writable and survives deploys. A shape from three
      // versions ago, or a hand-edited entry, must log the user out of the
      // feature — never take the app down on boot.
      localStorage.removeItem(key);
    }
  }

  // `$subscribe` fires after every mutation, whatever its form (direct, patch
  // object, patch function). `state` is the post-mutation state.
  store.$subscribe((_mutation, state) => {
    try {
      localStorage.setItem(key, JSON.stringify(pick(state)));
    } catch {
      // QuotaExceededError, or Safari in private mode. Losing persistence is
      // acceptable; losing the click that triggered it is not.
    }
  });
}
