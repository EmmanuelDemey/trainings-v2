import type { ReactElement } from 'react';
import type { RenderResult } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';

// TODO (1): `createTestQueryClient()` — a NEW `QueryClient` for every test,
// with `defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } }`.
// Why each of the two? The README asks.

// TODO (5): `createWrapper(queryClient)` — a component that renders its
// `children` inside `<QueryClientProvider client={queryClient}>`, for
// `renderHook(…, { wrapper })`.

/**
 * Renders ONE component — not the whole app — inside its own client, and
 * returns the client too, to seed it (`setQueryData`) or inspect it.
 */
export function renderWithClient(_ui: ReactElement): RenderResult & { queryClient: QueryClient } {
  // TODO (1): `render(ui, { wrapper: createWrapper(queryClient) })`, and the
  // client next to what `render` returns: `Object.assign(result, { queryClient })`.
  throw new Error('renderWithClient is not written yet');
}
