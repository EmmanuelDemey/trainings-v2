import type { Type } from '@angular/core';
import { render, type RenderComponentOptions } from '@testing-library/angular';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

/**
 * A client for ONE test:
 * - `retry: false` — a failing query fails at once, instead of retrying three
 *   times with a growing delay while the test waits for an error that is late.
 * - `gcTime: Infinity` — no garbage-collection timer is left behind when the
 *   test ends (the default 5 minutes would keep one running).
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

/**
 * Renders any component with a FRESH client — no test sees the cache of
 * another — and hands the client back, for the tests that look into it.
 */
export async function renderWithClient<T>(component: Type<T>, options: RenderComponentOptions<T> = {}) {
  const queryClient = createTestQueryClient();
  const result = await render(component, {
    ...options,
    providers: [provideTanStackQuery(queryClient), ...(options.providers ?? [])],
  });
  return { ...result, queryClient };
}
