import { QueryClient } from '@tanstack/vue-query';
import { ApiError } from '@/api/fakeApi';

/**
 * The one QueryClient of the app. `main.ts` installs it with `VueQueryPlugin`,
 * and the specs build a FRESH one per test with this same function
 * (`src/tests/render.ts`) — so these defaults apply to the specs too.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Fresh for 30 s: a component that mounts, or a filter you come back
        // to, reads the cache and sends NOTHING. Past that, the data is still
        // shown at once — and refetched in the background.
        //
        // `gcTime` (5 min by default) is another clock: how long a query
        // nobody observes stays in memory. Stale and cached are independent.
        staleTime: 30_000,

        // (Bonus) A 404 will still be a 404 in a second: give up at once.
        // Anything else (a 503, the network) gets the usual three retries.
        retry: (failureCount, error) => !(error instanceof ApiError && error.status === 404) && failureCount < 3,
      },
    },
  });
}
