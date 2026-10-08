import { QueryClient } from '@tanstack/react-query';

/**
 * The one QueryClient of the app. `main.tsx` hands it to `<QueryClientProvider>`,
 * and the specs build a fresh one per test from this same function — so they
 * run with YOUR defaults.
 */
export function createQueryClient(): QueryClient {
  // TODO (step 1): pass `defaultOptions: { queries: { staleTime: 30_000 } }`.
  // With the default `staleTime` of 0, every query is stale the moment it
  // arrives, and coming back to a filter refetches it.
  return new QueryClient();
}
