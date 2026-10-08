import { createApp } from 'vue';
import { handleHotUpdate } from 'vue-router/auto-routes';
import App from './App.vue';
import { createAppRouter } from './router';
import './style.css';

const router = createAppRouter();

// Rename a file under `src/pages/` and the routes swap in without losing the
// page you are on.
if (import.meta.hot) {
  handleHotUpdate(router);
}

createApp(App).use(router).mount('#app');
