import { ref, shallowRef, onScopeDispose, type Ref } from 'vue';

export interface UseAsyncDataReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  /** Runs the fetcher again, cancelling whatever is still in flight. */
  refresh: () => Promise<void>;
}

export interface UseAsyncDataOptions {
  /** Fetch straight away. Default: `true`. */
  immediate?: boolean;
}

/**
 * STEP 1 — the composable every view in this app leans on.
 *
 * The one idea worth carrying out of here: **aborting is not enough**. A
 * fetcher that ignores its signal still resolves, and a slow first response can
 * land after a fast second one. So every write to `data` / `error` / `loading`
 * is guarded by "am I still the current run?" — the `AbortController` handles
 * the network, the guard handles the state.
 */
export function useAsyncData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: UseAsyncDataOptions = {},
): UseAsyncDataReturn<T> {
  const { immediate = true } = options;

  // `shallowRef`: the payload is replaced wholesale, never mutated in place.
  const data = shallowRef<T | null>(null);
  const error = shallowRef<Error | null>(null);
  const loading = ref(false);

  /** The controller of the run in flight. One per run — never reused. */
  let current: AbortController | null = null;

  async function refresh(): Promise<void> {
    // Cancel the previous run before starting a new one.
    current?.abort();

    const controller = new AbortController();
    current = controller;

    loading.value = true;
    error.value = null;

    try {
      const result = await fetcher(controller.signal);

      // The guard. `controller !== current` means a newer `refresh()` started
      // while we were awaiting: this response is stale, and writing it would
      // overwrite fresher data with older data — the classic type-ahead bug
      // where the results flash back to a previous query.
      if (controller !== current) return;

      data.value = result;
    } catch (e) {
      if (controller !== current) return;

      // A cancelled request is not a failure — WE cancelled it. Surfacing it
      // would paint an error banner over data that is perfectly fine, and
      // clearing `data` would blank the screen between two loads.
      if ((e as Error).name === 'AbortError') return;

      error.value = e as Error;
    } finally {
      // Same guard, and it is the subtle one: without it a stale run's `finally`
      // flips `loading` to false while the live request is still in flight, and
      // the spinner disappears under a screen that has no data yet.
      if (controller === current) loading.value = false;
    }
  }

  // Leaving the route must not leave a request running. `onScopeDispose` rather
  // than `onUnmounted`: this also works when the composable is used inside
  // another composable's `effectScope`, with no component in sight.
  onScopeDispose(() => {
    current?.abort();
  });

  if (immediate) void refresh();

  return { data, error, loading, refresh };
}
