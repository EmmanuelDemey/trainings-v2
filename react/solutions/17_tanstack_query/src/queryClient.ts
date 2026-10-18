import { QueryClient } from '@tanstack/react-query';

/**
 * The application's cache, and its defaults. A function, not a module-level
 * constant: every test gets a fresh, empty cache from it.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // The default is 0: every data is stale at once, so every new mount
        // refetches it. People do not change every second — 30 s of trust
        // means "at most one request per 30 s" for each key.
        staleTime: 30_000,
      },
    },
  });
}
