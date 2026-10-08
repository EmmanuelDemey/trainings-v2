import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from './i18n';
import './style.css';

// A plugin, installed like any other — chapter 4, exactly.
createApp(App).use(i18n).mount('#app');
