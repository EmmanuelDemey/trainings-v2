import { QueryClient } from '@tanstack/react-query';

/**
 * The application's cache, and its defaults. A function, not a module-level
 * constant: every test gets a fresh, empty cache from it (src/tests/render.tsx).
 */
export function createQueryClient(): QueryClient {
  // TODO 1.1: in `defaultOptions.queries`, trust the data for 30 seconds
  //           (`staleTime: 30_000`) — the default, 0, refetches on every mount.
  return new QueryClient();
}
