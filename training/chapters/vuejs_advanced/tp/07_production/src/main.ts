import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import './style.css';

const app = createApp(App);

// TODO 6.1: add a last-resort error handler and log the error somewhere you can
//   actually read in production:
//     app.config.errorHandler = (err, instance, info) => { ... };
//
// TODO 6.2 (bonus): report the web vitals (`onLCP`, `onCLS`, `onINP` from the
//   `web-vitals` package) to the same place. Field data beats a Lighthouse run
//   on your laptop.

app.use(createPinia()).use(router).mount('#app');

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'App'} — TP 7`;
});
