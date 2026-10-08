import { inject } from 'vue';
import { toastKey, type ToastApi } from './types';

/**
 * The public entry point of the plugin.
 *
 * `inject` without a default returns `undefined` and only warns in development,
 * so a missing `app.use()` surfaces in production as
 * `Cannot read properties of undefined`, three call frames away from the real
 * mistake. Throwing here moves the error to the call site and writes the fix in
 * the message.
 */
export function useToast(): ToastApi {
  const api = inject(toastKey);

  if (!api) {
    throw new Error(
      '[toast] plugin not installed. Add `app.use(createToast())` in main.ts.',
    );
  }

  return api;
}
