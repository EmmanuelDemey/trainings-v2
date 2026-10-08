import { QueryClient } from '@tanstack/vue-query';

/**
 * The one QueryClient of the app — `main.ts` installs it, and the specs build a
 * fresh one per test from this same function, so they run with YOUR defaults.
 */
export function createQueryClient(): QueryClient {
  // TODO 1.1 — `staleTime` is 0 by default: every mount, every filter you come
  // back to, refetches. Give the queries a `staleTime` of 30 seconds in
  // `defaultOptions`.
  return new QueryClient();
}
