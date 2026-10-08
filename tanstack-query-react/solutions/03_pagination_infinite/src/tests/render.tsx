import { cleanup, render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from '../App';
import { createQueryClient } from '../queryClient';

/**
 * The only file of the specs that knows the app is written in React. The shared
 * spec (`shared/workshop.spec.ts`, the same for React, Angular and Vue) calls
 * it, then reads the page with `@testing-library/dom`.
 *
 * A FRESH client for each call: a cache left over from the previous test would
 * answer from memory, and the request counts would lie.
 */
export async function renderApp(): Promise<void> {
  // The setup file already unmounts after each test; this makes two renders in
  // one test safe too. Unmounting the provider also unsubscribes its client from
  // the focus and online events.
  cleanup();
  render(
    <QueryClientProvider client={createQueryClient()}>
      <App />
    </QueryClientProvider>,
  );
}
