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
 * Contract (written down as tests in `tests/useAsyncData.spec.ts`):
 *  - `refresh()` runs the fetcher with a fresh `AbortSignal`
 *  - a second `refresh()` ABORTS the first one, and the stale response — even if
 *    it lands last — must never overwrite `data`
 *  - `loading` is true while a request is in flight and false once the LAST one
 *    settles: an aborted request must not turn it off under the live one
 *  - an `AbortError` is not an error the caller should see
 *  - leaving the component (scope disposed) aborts the request in flight
 *
 * Run `npm run test:watch` and make the given spec green. It is the only part of
 * this workshop where the test is handed to you.
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

  // TODO 1.1: keep the controller of the request in flight here, and abort it at
  //   the top of `refresh()`. One controller per run — never reuse an aborted one.
  //
  // TODO 1.2: guard against the out-of-order response. Aborting the fetch is not
  //   enough on its own: a fetcher that ignores its signal still resolves. After
  //   the await, drop the result unless this run is still the current one
  //   (compare the controller you captured with the current one, or use a
  //   monotonic request id).
  //
  // TODO 1.3: `loading` belongs to the LAST run, not to whichever run happens to
  //   settle last. Same guard as 1.2.
  //
  // TODO 1.4: swallow `AbortError` (`(e as Error).name === 'AbortError'`) —
  //   a cancelled request is not a failure, and it must not clear `data`.
  //
  // TODO 1.5: abort whatever is in flight in `onScopeDispose`, so leaving the
  //   route does not leave a request running.

  async function refresh(): Promise<void> {
    const controller = new AbortController();
    loading.value = true;
    error.value = null;
    try {
      data.value = await fetcher(controller.signal);
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  onScopeDispose(() => {
    // TODO 1.5
  });

  if (immediate) void refresh();

  return { data, error, loading, refresh };
}
