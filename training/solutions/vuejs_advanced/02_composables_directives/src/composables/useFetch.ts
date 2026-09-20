import { ref, shallowRef, watchEffect, toValue, type MaybeRefOrGetter, type Ref } from 'vue';

export interface UseFetchReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
}

/**
 * STEP 1 — A real data-fetching composable.
 *
 *  - the URL can be a plain string, a ref or a getter (`MaybeRefOrGetter`)
 *  - changing the URL re-fetches, and ABORTS the in-flight request
 *  - a non-2xx response is an error, not silent `null` data
 *  - an `AbortError` is NOT an error the caller should see
 */
export function useFetch<T>(url: MaybeRefOrGetter<string>): UseFetchReturn<T> {
  // `shallowRef`: the payload is replaced wholesale and never mutated in place.
  const data = shallowRef<T | null>(null);
  const error = shallowRef<Error | null>(null);
  const loading = ref(false);

  watchEffect(async (onCleanup) => {
    // `toValue()` MUST be read inside the effect. Read it in the parameter list
    // and the getter is called once, the dependency is never tracked, and the
    // composable silently stops reacting.
    const resolved = toValue(url);

    const controller = new AbortController();

    // `onCleanup` runs before the next run of the effect AND when the owner
    // scope is disposed — so this one line covers both "the URL changed" and
    // "the component unmounted".
    onCleanup(() => controller.abort());

    // Synchronously, before the first await: a caller checking `error` right
    // after a URL change must already see it cleared, not the stale one.
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(resolved, { signal: controller.signal });

      // A late answer for an abandoned URL must never win the race. The guard is
      // belt-and-braces next to the abort, and it is the cheap kind of paranoia.
      if (controller.signal.aborted) return;

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as T;
      if (controller.signal.aborted) return;

      data.value = payload;
    } catch (caught) {
      // A cancelled request is not a failure the user should see — WE cancelled
      // it. Note that we also return BEFORE the `finally` can flip `loading`:
      // a replacement request is already in flight, and handing `loading` back
      // here would make the UI blink "loaded" between two categories.
      if (controller.signal.aborted) return;

      error.value = caught instanceof Error ? caught : new Error(String(caught));
    } finally {
      if (!controller.signal.aborted) loading.value = false;
    }
  });

  return { data, error, loading };
}
