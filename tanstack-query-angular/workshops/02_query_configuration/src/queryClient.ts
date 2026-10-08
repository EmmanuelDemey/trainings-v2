import { QueryClient } from '@tanstack/angular-query-experimental';

/**
 * The one place the app's `QueryClient` is built.
 *
 * `app.config.ts` provides it to the app, and `src/tests/render.ts` builds a
 * FRESH one for every spec — so the `defaultOptions` you set here apply in the
 * specs too, and no test sees the cache of the previous one.
 */
export function createQueryClient(): QueryClient {
  // TODO (step 1): `defaultOptions.queries.staleTime: 30_000` — a result stays
  // fresh for 30 seconds, and coming back to a filter sends nothing.
  return new QueryClient();
}
