import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// TODO 2.1: every view is imported STATICALLY, so they all land in the entry
//   chunk. Convert each one (except HomeView, which is the landing page) to a
//   lazy `() => import('@/views/XxxView.vue')` and rebuild.
//   Count the chunks in `dist/assets/` before and after.
import HomeView from '@/views/HomeView.vue';
import InvoicesView from '@/views/InvoicesView.vue';
import ReportsView from '@/views/ReportsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import AboutView from '@/views/AboutView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
  { path: '/invoices', name: 'invoices', component: InvoicesView, meta: { title: 'Invoices' } },
  { path: '/reports', name: 'reports', component: ReportsView, meta: { title: 'Reports' } },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { title: 'Settings' } },
  { path: '/about', name: 'about', component: AboutView, meta: { title: 'About' } },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 },
});

/**
 * TODO 2.2: export a `prefetch(name)` helper that triggers the dynamic import of
 * a route's component without navigating, so the navigation links can warm it up
 * on hover:
 *
 *   const loaders: Record<string, () => Promise<unknown>> = {
 *     invoices: () => import('@/views/InvoicesView.vue'),
 *     ...
 *   };
 *   export const prefetch = (name: string): void => { void loaders[name]?.(); };
 *
 * Then wire it in `App.vue` (TODO 2.3) and watch the chunk arrive on hover, in
 * the Network tab, BEFORE you click.
 */
