import type { ReactElement, ReactNode } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * A client made for tests — a NEW one for every test, never the app's:
 *
 * - `retry: false` — a failing query fails NOW. With the default 3 retries
 *   and their back-off, an error state shows up after ~7 s: past the timeout of
 *   `findBy*`, so the test fails for the wrong reason.
 * - `gcTime: Infinity` — no garbage-collection timer is started when a
 *   component unmounts, so none outlives the test. The cache dies with the
 *   client at the end of the test anyway.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

/** For `renderHook`: a component that provides `queryClient` to the hook under test. */
export function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

/**
 * Renders ONE component — not the whole app — inside its own client. Returns
 * the client too, to seed it (`setQueryData`) or inspect it (`getQueryState`).
 */
export function renderWithClient(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  return Object.assign(render(ui, { wrapper: createWrapper(queryClient) }), { queryClient });
}
