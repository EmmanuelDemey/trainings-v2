import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createAppRouter } from './router';
import { installFakeBackend } from './api/fakeBackend';
import './style.css';

// Under Cypress the e2e suite owns the whole network: `cy.intercept` listens on
// the same layer this patch does, so leaving it installed would swallow every
// request before the interceptor sees it.
if (!('Cypress' in window)) {
  installFakeBackend();
}

createApp(App).use(createPinia()).use(createAppRouter()).mount('#app');
