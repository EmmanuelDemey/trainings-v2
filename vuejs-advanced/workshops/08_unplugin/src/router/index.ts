import { createRouter, createWebHistory, type Router } from 'vue-router';
import { routes } from './routes';

/**
 * TODO 1.3: once the pages are in place, the array comes from the virtual
 *   module instead:
 *
 *     import { routes } from 'vue-router/auto-routes';
 *
 *   Its companion `handleHotUpdate(router)` is the bonus of step 5, and it goes
 *   in `main.ts`, not here: it talks to the dev server, and this factory has to
 *   stay callable from a spec.
 */
export function createAppRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes,
  });
}
