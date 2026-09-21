import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';

/**
 * TODO 2: wire `app.config.errorHandler` — the **last** stop before the console.
 *   Everything no boundary stopped lands here, and this is where the reporting
 *   for the rest belongs: `capture(err, { info, source: 'app' })`.
 *
 *   Two rules: it receives the same triple as `onErrorCaptured`, and it must
 *   **never throw**. Vue catches it (`info: 'app errorHandler'`) but the
 *   original error is gone by then.
 */
export function createOpsApp(): VueApp<Element> {
  const app = createApp(App);

  return app;
}
