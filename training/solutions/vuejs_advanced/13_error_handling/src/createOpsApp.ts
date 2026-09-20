import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';
import { capture } from './observability/reporter';

/**
 * `app.config.errorHandler` is the **last** stop before the console: everything
 * no boundary stopped lands here, which makes it the right place for reporting
 * and the wrong place for UI.
 *
 * It receives the same triple as `onErrorCaptured`, `info` included — the single
 * most useful field in a report, because it names the lifecycle phase that blew
 * up where a minified stack trace does not.
 *
 * It must **never throw**. Vue would catch that too (`info: 'app errorHandler'`)
 * and the original error would be gone.
 */
export function createOpsApp(): VueApp<Element> {
  const app = createApp(App);

  app.config.errorHandler = (err, _instance, info) => {
    try {
      capture(err, { info, source: 'app' });
    } catch {
      // Losing a report beats losing the error that caused it.
    }
  };

  return app;
}
