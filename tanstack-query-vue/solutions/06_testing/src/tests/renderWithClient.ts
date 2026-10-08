import { render, type RenderResult } from '@testing-library/vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import type { Component } from 'vue';

/**
 * A client tuned for tests — NOT the app's `createQueryClient()`:
 *
 * - `retry: false` — an error test would otherwise wait for three retries
 *   (1 s + 2 s + 4 s of backoff) before the error reaches the screen;
 * - `gcTime: Infinity` — no garbage-collection timer is started when a query
 *   loses its last observer, so nothing is left ticking after the test (the
 *   classic "Jest did not exit one second after the test run" with Jest).
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
 * Renders `component` inside a FRESH client: no cache shared between two
 * tests, so their order never matters. Returns the client too — to read the
 * cache, or spy on it.
 */
export function renderWithClient(
  component: Component,
  props: Record<string, unknown> = {},
): RenderResult & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();
  const result = render(component, {
    props,
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  });
  return { ...result, queryClient };
}
