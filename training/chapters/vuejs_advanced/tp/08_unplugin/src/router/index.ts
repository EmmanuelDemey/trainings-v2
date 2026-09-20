import { createRouter, createWebHistory, type Router } from 'vue-router';
import { routes } from './routes';

/**
 * TODO 3 (continued): once the pages are in place, the array comes from the
 *   virtual module instead:
 *
 *     import { routes, handleHotUpdate } from 'vue-router/auto-routes';
 *
 *   `handleHotUpdate(router)` behind `import.meta.hot` keeps the current page
 *   alive while you rename a file.
 */
export function createAppRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes,
  });
}
