import { createApp } from 'vue';
import App from './App.vue';
import { installFakeBackend } from './api/fakeBackend';
import './style.css';

// The dev server has no backend: /api/* is answered in the browser. Vitest
// answers the same routes with MSW (`tests/msw.ts`), so both agree on the contract.
installFakeBackend();

createApp(App).mount('#app');
