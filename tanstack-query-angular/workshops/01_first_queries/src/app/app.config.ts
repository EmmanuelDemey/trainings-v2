import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // TODO (step 1): provide the QueryClient to the whole app with
    // `provideTanStackQuery(createQueryClient(), withDevtools())`.
    //   - `provideTanStackQuery` comes from '@tanstack/angular-query-experimental'
    //   - `withDevtools` comes from '@tanstack/angular-query-experimental/devtools'
    //   - `createQueryClient` comes from '../queryClient'
  ],
};
