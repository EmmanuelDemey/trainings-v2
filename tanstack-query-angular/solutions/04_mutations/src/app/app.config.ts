import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';
import { createQueryClient } from '../queryClient';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // One client for the whole app: every `injectQuery` below reads and writes
    // its cache. `withDevtools()` adds the floating TanStack Query panel — in
    // development builds only: the `/devtools` entry point resolves to a stub
    // in production.
    provideTanStackQuery(createQueryClient(), withDevtools()),
  ],
};
