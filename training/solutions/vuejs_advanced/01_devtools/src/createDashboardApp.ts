import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';

/**
 * Builds the application, instruments included.
 *
 * `performance` makes Vue emit `performance.mark()` entries around each
 * component's init / compile / render / patch, which the browser's Performance
 * panel then shows on its own track. It is guarded by `import.meta.env.DEV`
 * because the marks cost time and a production build strips the tracing anyway —
 * which is also the answer to "why does the panel go quiet in production?".
 */
export function createDashboardApp(): VueApp<Element> {
  const app = createApp(App);

  if (import.meta.env.DEV) {
    app.config.performance = true;
  }

  return app;
}
