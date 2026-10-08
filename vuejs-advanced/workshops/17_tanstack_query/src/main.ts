import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// TODO 1.2 — install `VueQueryPlugin`, with the client `createQueryClient()`
// (`src/queryClient.ts`) returns. Until then, `useQuery` throws on the first
// component that calls it: "vue-query hooks can only be used if VueQueryPlugin
// is installed".
createApp(App).mount('#app');
