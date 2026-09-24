import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { createQueryClient } from './queryClient';
import './style.css';

createApp(App).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');
