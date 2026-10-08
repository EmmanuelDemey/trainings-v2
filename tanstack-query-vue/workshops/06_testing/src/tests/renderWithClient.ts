import type { RenderResult } from '@testing-library/vue';
import type { Component } from 'vue';
import type { QueryClient } from '@tanstack/vue-query';

// TODO (step 1) — a client tuned for tests, NOT the app's `createQueryClient()`:
// `new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity },
// mutations: { retry: false } } })`. Why each option? See the README.
export function createTestQueryClient(): QueryClient {
  throw new Error('TODO (step 1): createTestQueryClient');
}

// TODO (step 1) — render `component` with Testing Library's `render`, inside
// a FRESH client per call (`global.plugins: [[VueQueryPlugin, { queryClient }]]`),
// and return the render result plus the client.
export function renderWithClient(
  _component: Component,
  _props: Record<string, unknown> = {},
): RenderResult & { queryClient: QueryClient } {
  throw new Error('TODO (step 1): renderWithClient');
}
