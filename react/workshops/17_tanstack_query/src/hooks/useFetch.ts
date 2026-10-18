import { useEffect, useState } from 'react';

type FetchState<T> = { data: T | undefined; loading: boolean; error: Error | undefined };

/**
 * The hand-written data fetching of the earlier chapters — what TanStack Query
 * replaces. It works, and it does nothing more than fetch: no cache (every
 * mount asks again), no sharing (two components, two requests), no way for
 * another component to say "this data changed".
 *
 * Delete this file once nothing imports it any more (step 3).
 */
export function useFetch<T>(load: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: undefined, loading: true, error: undefined });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: undefined, loading: true, error: undefined });
    load(controller.signal).then(
      (data) => setState({ data, loading: false, error: undefined }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
        }
      },
    );
    return () => controller.abort();
    // The caller owns the dependencies — one more thing to get wrong by hand.
  }, deps);

  return state;
}
