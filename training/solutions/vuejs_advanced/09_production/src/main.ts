import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { config } from './config';
import './style.css';

const app = createApp(App);

/**
 * STEP 6 — The last-resort error handler.
 *
 * Vue swallows errors thrown in render functions, lifecycle hooks and watchers:
 * without this, the component subtree disappears and the only trace is a line in
 * a console nobody is reading. This is where a component crash becomes a signal.
 *
 * `info` is the part people forget — Vue tells you WHICH hook threw ("render
 * function", "watcher callback", "setup function"), which is usually more
 * useful than the stack in a minified bundle.
 */
app.config.errorHandler = (err, instance, info) => {
  const payload = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    component: instance?.$options.name ?? instance?.$.type.__name ?? 'unknown',
    hook: info,
    route: router.currentRoute.value.fullPath,
    mode: config.mode,
  };

  // In development, be loud and keep the stack clickable.
  if (!config.isProduction) {
    console.error('[vue error]', payload, err);
    return;
  }

  // In production, ship it. Sentry / Datadog / your own endpoint — the point is
  // that it leaves the user's machine, because you are never going to see their
  // console. `sendBeacon` survives the page being closed a millisecond later,
  // which `fetch` does not.
  //
  // navigator.sendBeacon('/api/client-errors', JSON.stringify(payload));
  console.error('[vue error]', payload);
};

/**
 * The other half nobody wires up: errors that never reach Vue at all — a
 * rejected promise in a `.then` chain, a listener registered outside a
 * component. `errorHandler` sees none of these.
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandled rejection]', event.reason);
});

/**
 * Bonus — web vitals.
 *
 * `npm i web-vitals`, then:
 *
 *   import { onCLS, onINP, onLCP } from 'web-vitals';
 *   const report = (metric: { name: string; value: number; rating: string }) =>
 *     navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
 *   onLCP(report); onCLS(report); onINP(report);
 *
 * Field data beats a Lighthouse run on your laptop, and it is not close: your
 * laptop is a fast machine on a fast network running one tab. The p75 of your
 * actual users is the number Google ranks you on and the one your users feel.
 */

app.use(createPinia()).use(router).mount('#app');

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'App'} — TP 8`;
});
