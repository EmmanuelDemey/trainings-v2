import { ref, watch, type Ref } from 'vue';

/**
 * STEP 2 — A ref synchronised with `localStorage`.
 *
 * Requirements:
 *  - read the stored value on creation, fall back to `initial` when absent
 *  - a corrupted entry must NOT crash the app (try it: write `{{{` by hand in
 *    the devtools Application tab, then reload)
 *  - write back on every change, deeply
 *  - stay in sync across tabs via the `storage` event (bonus)
 */
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const value = ref(initial) as Ref<T>;

  // TODO 2.1: read `localStorage.getItem(key)`. If it exists, `JSON.parse` it
  //   inside a try/catch and assign it to `value`. On a parse error, remove the
  //   corrupted entry and keep `initial`.

  // TODO 2.2: watch `value` with `{ deep: true }` and write
  //   `localStorage.setItem(key, JSON.stringify(value.value))`.
  //   Note the trap: `deep: true` is required because callers will push into an
  //   array rather than reassign it.

  // TODO 2.3 (bonus): listen to the `storage` event on `window` to stay in sync
  //   across tabs, and remove the listener on unmount. Open the app in two tabs
  //   to verify.
  //   Which composable from the slides would you reuse here?

  void key;
  void watch;

  return value;
}
