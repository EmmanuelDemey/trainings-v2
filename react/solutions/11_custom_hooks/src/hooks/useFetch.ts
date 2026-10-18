import { useEffect, useState } from 'react';

export interface FetchState<T> {
  /** The last successful response body; kept while the next URL loads. */
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * GETs `url` as JSON, and again every time it changes. `null` means "nothing
 * to fetch yet": no request, not loading.
 *
 * A custom hook is just a function whose name starts with `use` and that calls
 * other hooks: each component calling it gets its OWN state and effect.
 */
export function useFetch<T>(url: string | null): FetchState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(url !== null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (url === null) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        // `fetch` resolves on a 404 or a 500: the status is ours to check.
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        setData((await response.json()) as T);
      })
      .catch((reason: unknown) => {
        // The rejection of a request we aborted ourselves is not an error.
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // A new URL — or an unmount — aborts the request in flight: a late
    // response for an old URL can never overwrite the current one.
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
