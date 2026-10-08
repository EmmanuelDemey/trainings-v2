import { QueryClient } from '@tanstack/angular-query-experimental';

/**
 * The one place the app's `QueryClient` is built.
 *
 * `app.config.ts` provides it to the app, and `src/tests/render.ts` builds a
 * FRESH one for every spec — so the `defaultOptions` you set here apply in the
 * specs too, and no test sees the cache of the previous one.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // For 30 seconds after it arrived, a result is FRESH: every component
        // that asks for it gets it from the cache, and nothing is sent. After
        // that it is stale — still shown, but refetched on the next trigger
        // (a new observer, a focus, a reconnect). `gcTime` (5 minutes by
        // default) is another clock: how long an UNUSED entry stays in memory.
        staleTime: 30_000,
      },
    },
  });
}
