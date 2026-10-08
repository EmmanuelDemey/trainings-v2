import { QueryClient } from '@tanstack/vue-query';

/**
 * The one QueryClient of the app. `main.ts` installs it with `VueQueryPlugin`,
 * and the specs build a FRESH one per test with this same function
 * (`src/tests/render.ts`) — so whatever you put in `defaultOptions` applies to
 * the specs too.
 */
export function createQueryClient(): QueryClient {
  // TODO (step 1) — `defaultOptions.queries.staleTime: 30_000`: a filter you
  // come back to within 30 s must not be refetched.
  // TODO (bonus) — `retry`: no retry on a 404 (`error instanceof ApiError &&
  // error.status === 404`), the usual three otherwise.
  return new QueryClient();
}
