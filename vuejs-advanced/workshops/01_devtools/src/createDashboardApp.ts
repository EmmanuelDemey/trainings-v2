import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';

/**
 * Builds the application, instruments included.
 *
 * TODO 1: turn Vue's performance tracing on in development, so the browser's
 *   Performance panel shows the `init` / `compile` / `render` / `patch` marks of
 *   every component. One line — and it must stay out of a production build,
 *   where the marks cost time and tell the panel nothing.
 *   Hint: `app.config.performance`, and `import.meta.env.DEV`.
 */
export function createDashboardApp(): VueApp<Element> {
  const app = createApp(App);

  return app;
}
