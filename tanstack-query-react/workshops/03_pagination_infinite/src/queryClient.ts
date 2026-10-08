import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api/fakeApi';

/**
 * The one QueryClient of the app. `main.tsx` hands it to `<QueryClientProvider>`,
 * and the specs build a fresh one per test from this same function — so they
 * run with YOUR defaults.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Fresh for 30 s: a component mounting, or a filter you come back to,
        // reads the cache instead of refetching. Past that, the data is still
        // SHOWN at once — it is refetched in the background.
        // `gcTime` (5 min by default) is another clock: how long a query nobody
        // uses stays in memory. Stale and cached is the normal state.
        staleTime: 30_000,

        // (Bonus) Retrying cannot turn a 404 into a 200: give up at once. Any
        // other failure — a 503, a network error — gets the default 3 retries.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status === 404) return false;
          return failureCount < 3;
        },
      },
    },
  });
}
