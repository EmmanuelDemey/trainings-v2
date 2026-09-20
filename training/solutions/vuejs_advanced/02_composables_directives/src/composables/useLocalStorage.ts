import { onScopeDispose, ref, watch, type Ref } from 'vue';

/**
 * STEP 2 — A ref synchronised with `localStorage`.
 *
 *  - read the stored value on creation, fall back to `initial` when absent
 *  - a corrupted entry must NOT crash the app
 *  - write back on every change, deeply
 *  - stay in sync across tabs via the `storage` event
 */
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const value = ref(initial) as Ref<T>;

  /** Reads the key, and treats an unparseable entry as "no entry". */
  function read(raw: string | null): void {
    if (raw === null) return;
    try {
      value.value = JSON.parse(raw) as T;
    } catch {
      // Anything can end up in localStorage: another version of the app, a
      // browser extension, a user with the devtools open. Crashing the whole app
      // on a bad JSON string is not an option — drop it and move on.
      localStorage.removeItem(key);
    }
  }

  read(localStorage.getItem(key));

  // `deep: true` is required, not optional: callers push into the array rather
  // than reassign it, and a shallow watcher never fires on `ids.value.push(id)`.
  watch(
    value,
    (current) => {
      localStorage.setItem(key, JSON.stringify(current));
    },
    { deep: true },
  );

  /**
   * Cross-tab sync. The `storage` event fires in every OTHER tab of the same
   * origin — never in the one that wrote, which is exactly what stops this from
   * being an infinite loop.
   */
  function onStorage(event: StorageEvent): void {
    if (event.key !== key) return;
    read(event.newValue);
  }

  window.addEventListener('storage', onStorage);

  // `onScopeDispose` rather than `onUnmounted`: this composable can legitimately
  // be called from a module-scope `effectScope` (see `useFavorites`), where
  // there is no component to unmount and `onUnmounted` would warn and no-op.
  onScopeDispose(() => {
    window.removeEventListener('storage', onStorage);
  });

  return value;
}
