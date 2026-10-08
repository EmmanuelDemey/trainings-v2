import { createApp } from 'vue';
import App from './App.vue';
import { directivesPlugin } from './directives';
import { installFakeBackend } from './api/fakeApi';
import './style.css';

// Patches window.fetch for /api/* — everything else goes to the network.
installFakeBackend();

createApp(App).use(directivesPlugin).mount('#app');
