import { createRouter, createWebHistory, type Router } from 'vue-router';
import { routes } from 'vue-router/auto-routes';

/**
 * No array to maintain. `routes` is a virtual module the plugin rebuilds from
 * `src/pages/` on every change.
 *
 * HMR wiring lives in `main.ts`, not here: `handleHotUpdate` talks to the dev
 * server, and this factory has to stay callable from a spec.
 */
export function createAppRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes,
  });
}
