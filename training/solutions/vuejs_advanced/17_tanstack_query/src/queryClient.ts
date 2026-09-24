import { QueryClient } from '@tanstack/vue-query';

/**
 * The one QueryClient of the app — `main.ts` installs it, and the specs build a
 * fresh one per test from this same function, so they run with YOUR defaults.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // Fresh for 30 s: a component mounting, or a filter you come back to,
      // reads the cache instead of refetching. Past that, the data is still
      // SHOWN at once — it is refetched in the background.
      queries: { staleTime: 30_000 },
    },
  });
}
