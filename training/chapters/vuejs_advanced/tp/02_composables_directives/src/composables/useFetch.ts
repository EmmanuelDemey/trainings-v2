import { ref, shallowRef, watchEffect, toValue, type MaybeRefOrGetter, type Ref } from 'vue';

export interface UseFetchReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
}

/**
 * STEP 1 — Write a real data-fetching composable.
 *
 * Requirements:
 *  - the URL can be a plain string, a ref or a getter (`MaybeRefOrGetter`)
 *  - changing the URL re-fetches, and ABORTS the in-flight request
 *  - a non-2xx response is an error, not silent `null` data
 *  - an `AbortError` is NOT an error the caller should see
 *
 * The panel displays `requestLog` so you can check that a fast sequence of
 * changes leaves exactly one non-aborted request.
 */
export function useFetch<T>(url: MaybeRefOrGetter<string>): UseFetchReturn<T> {
  // `shallowRef`: the payload is replaced wholesale and never mutated in place.
  const data = shallowRef<T | null>(null);
  const error = shallowRef<Error | null>(null);
  const loading = ref(false);

  // TODO 1.1: replace this one-shot fetch with a `watchEffect` so the composable
  //   re-fetches whenever the URL source changes.
  //   Remember: read the source with `toValue(url)` INSIDE the effect, otherwise
  //   the dependency is never tracked.
  //
  // TODO 1.2: create an `AbortController` per run and abort it via the effect's
  //   `onCleanup` callback:
  //     watchEffect(async (onCleanup) => {
  //       const controller = new AbortController();
  //       onCleanup(() => controller.abort());
  //       ...
  //     });
  //
  // TODO 1.3: set `loading` around the request, reset `error` at the start, and
  //   throw on `!response.ok` so a 500 surfaces as an error.
  //   Trigger it with `failureSwitch.products = true` in `src/api/fakeApi.ts`.
  //
  // TODO 1.4: swallow `AbortError` — a cancelled request is not a failure.
  //   Careful: `loading` must still be handled correctly when a request aborts.

  watchEffect(() => {
    const resolved = toValue(url);
    void resolved;
    // TODO: the real implementation goes here.
  });

  return { data, error, loading };
}
