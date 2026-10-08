import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// `HomeView` stays STATIC: it is the landing page, so lazy-loading it would only
// add a round trip between the first paint and the first content.
import HomeView from '@/views/HomeView.vue';

/**
 * The loaders, declared once and shared between the route records and
 * `prefetch`. Two `import()` calls with the same specifier resolve to the same
 * module and the same chunk — but keeping one source avoids the drift where the
 * prefetch warms a chunk the router no longer uses.
 */
const loaders = {
  invoices: () => import('@/views/InvoicesView.vue'),
  reports: () => import('@/views/ReportsView.vue'),
  settings: () => import('@/views/SettingsView.vue'),
  about: () => import('@/views/AboutView.vue'),
} satisfies Record<string, () => Promise<unknown>>;

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
  { path: '/invoices', name: 'invoices', component: loaders.invoices, meta: { title: 'Invoices' } },
  { path: '/reports', name: 'reports', component: loaders.reports, meta: { title: 'Reports' } },
  { path: '/settings', name: 'settings', component: loaders.settings, meta: { title: 'Settings' } },
  { path: '/about', name: 'about', component: loaders.about, meta: { title: 'About' } },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 },
});

/**
 * Warms a route's chunk without navigating.
 *
 * Lazy routes trade bundle size for a round trip at click time. Prefetching on
 * hover buys the size back without the latency: a pointer takes ~200-300 ms to
 * travel to a link and press it, which is usually more than enough to fetch a
 * 5 kB chunk. On `@focus` too, so keyboard users get the same deal.
 *
 * `void` the promise on purpose: a failed prefetch must not produce an unhandled
 * rejection. If the network is down, the real navigation will fail loudly, and
 * that is the failure worth showing.
 */
export function prefetch(name: keyof typeof loaders): void {
  void loaders[name]?.().catch(() => {});
}
