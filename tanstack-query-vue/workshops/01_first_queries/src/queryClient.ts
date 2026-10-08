import { QueryClient } from '@tanstack/vue-query';

/**
 * The one QueryClient of the app. `main.ts` installs it with `VueQueryPlugin`,
 * and the specs build a FRESH one per test with this same function
 * (`src/tests/render.ts`) — so whatever you put in `defaultOptions` applies to
 * the specs too.
 *
 * Nothing configured yet: workshop 01 runs on the defaults — `staleTime: 0`,
 * `gcTime: 5 min`, three retries — on purpose. Chapter 02 changes them.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient();
}
