import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { persistPlugin } from './plugins/persist';
import { loggerPlugin } from './plugins/logger';
import './style.css';

const pinia = createPinia();

// The plugins are registered from the start — they are no-ops until you
// implement them.
pinia.use(persistPlugin);
pinia.use(loggerPlugin);

createApp(App).use(pinia).mount('#app');
