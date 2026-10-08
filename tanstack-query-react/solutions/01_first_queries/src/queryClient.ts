import { QueryClient } from '@tanstack/react-query';

/**
 * The one QueryClient of the app. `main.tsx` hands it to `<QueryClientProvider>`,
 * and the specs build a fresh one per test from this same function — so they
 * run with YOUR defaults.
 *
 * No `defaultOptions` yet: `staleTime` is 0, so every query is stale the moment
 * it arrives. Workshop 02 changes that.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient();
}
