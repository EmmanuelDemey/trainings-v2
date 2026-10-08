import { ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue';

/** One optional options object, always last: adding a key stays a minor version. */
export interface UseDebouncedOptions {
  /** Milliseconds of quiet before the value is published. */
  delay?: number;
}

/**
 * Exported **by name**: consumers need it to type a wrapper, a prop or a store
 * field, and it is the type semver holds you to.
 */
export interface UseDebouncedReturn<T> {
  /** The caller reads it. Only this composable writes it. */
  value: Readonly<Ref<T>>;
  /** True between a change of the source and the moment it is published. */
  pending: Readonly<Ref<boolean>>;
  /** Publish right now, cancelling the wait. */
  flush(): void;
  /** Drop the pending change — the published value stays as it is. */
  cancel(): void;
}

/**
 * Publishes `source` only once it has stopped changing for `delay` ms.
 *
 * TODO 1: unwrap `source` with `toValue()` and `watch` it. The signature already
 *   says `MaybeRefOrGetter`, so a caller may pass a plain value, a `ref` or a
 *   getter and never has to think about it — your body has to honour that.
 *
 * TODO 2: resolve `delay` once, here, with a default of 300. Never re-read the
 *   option inside the watcher.
 *
 * TODO 3: on every change, cancel the timer that was pending and schedule a new
 *   one. `pending` is true in between. `flush()` publishes now, `cancel()` drops
 *   the wait.
 *
 * TODO 4: own your effects — `onScopeDispose` must clear the pending timer, so
 *   the composable cleans up inside a component, a store or a bare
 *   `effectScope()` alike. Pass `true` as its second argument to stay silent
 *   when there is no scope, and warn yourself instead (see `usePolling`).
 */
export function useDebounced<T>(
  source: MaybeRefOrGetter<T>,
  options: UseDebouncedOptions = {},
): UseDebouncedReturn<T> {
  const value = ref(toValue(source)) as Ref<T>;
  const pending = ref(false);

  return {
    value,
    pending,
    flush: () => {},
    cancel: () => {},
  };
}
