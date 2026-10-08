import { createApp } from 'vue';
import App from './App.vue';
import { mountNetworkPanel } from './api/networkPanel';
import './style.css';

// TODO (step 1) — install `VueQueryPlugin` with `{ queryClient: createQueryClient() }`
// (`src/queryClient.ts`), and render `<VueQueryDevtools />` next to `App`:
//
//   const root = () => [h(App), h(VueQueryDevtools, { buttonPosition: 'top-right' })];
//   createApp(root).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');
//
// Until then, the first `useQuery` throws: "vue-query hooks can only be used
// if VueQueryPlugin is installed".
createApp(App).mount('#app');

// The panel at the bottom of the page: every request the fake server received.
mountNetworkPanel();
