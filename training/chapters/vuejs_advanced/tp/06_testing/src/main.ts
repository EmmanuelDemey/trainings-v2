import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import { routes } from './router/routes';
import { installFakeBackend } from './api/fakeBackend';
import './style.css';

// The dev server has no backend: /api/* is answered in the browser. Cypress
// stubs the same routes with `cy.intercept`, so both agree on the contract.
installFakeBackend();

const router = createRouter({ history: createWebHistory(), routes });

createApp(App).use(createPinia()).use(router).mount('#app');
