import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import './style.css';

const app = createApp(App);

/**
 * The last-resort handler, for what the error boundary did not catch.
 *
 * What reaches it: anything Vue itself invoked and nobody caught — a render
 * function, a lifecycle hook, a watcher callback, an event handler, in a subtree
 * with no `onErrorCaptured` above it (or one that returned `true`).
 *
 * What does NOT: a rejected promise nobody awaited, a `setTimeout` callback, a
 * listener registered on `window` by hand. There is no component on the stack by
 * then — hence the second listener below.
 *
 * `info` is the field people skip and then miss: Vue names the hook that threw
 * ("render function", "setup function", "watcher callback"), which beats a stack
 * trace in a minified bundle.
 */
app.config.errorHandler = (err, instance, info) => {
  console.error('[vue]', info, err, instance?.$options.name ?? instance?.$.type.__name);
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandled rejection]', event.reason);
});

app.use(createPinia());
app.use(router);
app.mount('#app');
