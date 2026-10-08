import {
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';

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
 * Convention 1 — `MaybeRefOrGetter` in, unwrapped with `toValue`, so a caller
 * may pass a value, a `ref` or a getter without thinking about it. The default
 * is resolved once, here, and never re-read inside the watcher.
 *
 * Convention 2 — an object of refs out, `Readonly` on what the caller has no
 * business writing, and the return type exported by name.
 *
 * Convention 3 — the pending timer is cleared by `onScopeDispose`, so this works
 * inside a component, a store, a plugin or a bare `effectScope()`.
 */
export function useDebounced<T>(
  source: MaybeRefOrGetter<T>,
  options: UseDebouncedOptions = {},
): UseDebouncedReturn<T> {
  const { delay = 300 } = options;

  const value = ref(toValue(source)) as Ref<T>;
  const pending = ref(false);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let incoming = value.value;

  function cancel(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    pending.value = false;
  }

  function flush(): void {
    cancel();
    value.value = incoming;
  }

  watch(
    () => toValue(source),
    (next) => {
      incoming = next;
      cancel();
      pending.value = true;
      timer = setTimeout(flush, delay);
    },
  );

  // `true` keeps it silent when there is no scope: this composable leaks nothing
  // the caller cannot see, unlike `usePolling`.
  onScopeDispose(cancel, true);

  return { value, pending, flush, cancel };
}
