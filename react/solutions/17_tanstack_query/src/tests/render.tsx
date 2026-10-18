import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../queryClient';

/**
 * Renders `ui` inside a QueryClientProvider, with a FRESH client: a cache left
 * over from the previous test would answer from memory and lie about the
 * requests. It is the app's own client — same `staleTime`, same defaults —
 * except for the retries: a failing query retries 3 times with a back-off by
 * default, which would make every error test wait for seconds.
 */
export function renderWithClient(ui: ReactElement) {
  const queryClient = createQueryClient();
  const defaults = queryClient.getDefaultOptions();
  queryClient.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, retry: false } });
  return { queryClient, ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>) };
}
