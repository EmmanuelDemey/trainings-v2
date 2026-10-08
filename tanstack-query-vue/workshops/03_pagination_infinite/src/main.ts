import { createApp, h } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import App from './App.vue';
import { mountNetworkPanel } from './api/networkPanel';
import { createQueryClient } from './queryClient';
import './style.css';

// The root renders the app AND the devtools (the TanStack logo, top right —
// the Network panel takes the bottom). They live here rather than in App.vue
// because the specs render App alone (src/tests/render.ts): the devtools are
// a tool for you, not part of what the specs check. In a production build the
// package resolves to an empty stub — nothing to remove before shipping.
const root = () => [h(App), h(VueQueryDevtools, { buttonPosition: 'top-right' })];

// The plugin `provide`s the client to every component of the app — the Vue
// equivalent of React's <QueryClientProvider>. Passing our own client (rather
// than `queryClientConfig`) lets the specs build theirs with the same function.
createApp(root).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');

// The panel at the bottom of the page: every request the fake server received.
mountNetworkPanel();
