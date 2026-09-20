import { inject } from 'vue';
import { toastKey, type ToastApi } from './types';

/**
 * The public entry point of the plugin.
 *
 * TODO 6: `inject` without a default returns `undefined` and only warns in
 *   development — in production the app crashes three call frames away from the
 *   real mistake. Throw here instead, with the missing call written in the
 *   message: `app.use(createToast())` in `main.ts`. One line, and it is the
 *   highest-value line of a plugin other teams have to adopt.
 */
export function useToast(): ToastApi {
  return inject(toastKey) as ToastApi;
}
