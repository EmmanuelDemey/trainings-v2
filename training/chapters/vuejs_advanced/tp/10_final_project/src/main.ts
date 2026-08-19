import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import './style.css';

const app = createApp(App);

// TODO 4.4: a `app.config.errorHandler` that logs what the error boundary did
//   not catch (chapter 8bis). One line is enough — but know what reaches it and
//   what does not.

app.use(createPinia());
app.use(router);
app.mount('#app');
