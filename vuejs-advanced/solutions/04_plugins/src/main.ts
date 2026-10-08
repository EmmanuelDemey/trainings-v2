import { createApp } from 'vue';
import App from './App.vue';
import { createToast } from './plugins/toast';
import './style.css';

createApp(App)
  // Two toasts at a time, six seconds each — the defaults are three and four.
  .use(createToast({ max: 2, duration: 6000 }))
  .mount('#app');
