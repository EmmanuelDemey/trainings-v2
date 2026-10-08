import { render } from '@testing-library/angular';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { App } from '../app/app';
import { createQueryClient } from '../queryClient';

/**
 * Renders the whole app for the shared specs — the only file of the specs that
 * knows it is Angular.
 *
 * - The providers are those of `app.config.ts`, minus the devtools: a FRESH
 *   `createQueryClient()` per call, so no test sees the cache of another.
 * - The previous render is cleaned up for us: Testing Library destroys its
 *   fixtures after each test, and TestBed tears its module down — which
 *   destroys the injector, which unmounts the client.
 * - Zoneless, like the app: signals schedule change detection on their own,
 *   and Testing Library's `findBy*` / `waitFor` wait for the DOM to follow.
 */
export async function renderApp(): Promise<void> {
  await render(App, {
    providers: [provideTanStackQuery(createQueryClient())],
  });
}
