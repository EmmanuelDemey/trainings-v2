import { cleanup, render } from '@testing-library/vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from '@/App.vue';
import { createQueryClient } from '@/queryClient';

/**
 * The only file of the specs that knows Vue: the shared specs in `shared/` call
 * it, then read the DOM with Testing Library — the same specs run against the
 * React and the Angular versions of this workshop.
 *
 * Renders the whole app, as `main.ts` does, inside a FRESH client built by
 * YOUR `createQueryClient()`: no cache leaks from one test to the next, and
 * your `defaultOptions` apply.
 */
export async function renderApp(): Promise<void> {
  // Testing Library unmounts after each test on its own (it registers a global
  // `afterEach`: `globals: true` in vitest.config.ts). Cleaning up here as well
  // makes a second render in the same test replace the first, never stack.
  // Unmounting the app also unmounts its client: no focus or online listener
  // of an old client survives into the next test.
  cleanup();
  render(App, {
    global: { plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]] },
  });
}
