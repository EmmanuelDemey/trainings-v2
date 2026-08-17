import { createApp, type App } from 'vue';
import { createRouter, createMemoryHistory, type Router, type RouteRecordRaw } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';
import InvoiceList from '@/components/InvoiceList.vue';

/** Minimal route table, enough to exercise redirects in the login flow. */
export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: { template: '<div>home</div>' } },
  { path: '/login', name: 'login', component: LoginForm },
  { path: '/invoices', name: 'invoices', component: InvoiceList },
  { path: '/admin', name: 'admin', component: { template: '<div>admin</div>' } },
];

/**
 * A fresh memory-history router per test — never share one between tests, the
 * current location leaks.
 */
export function makeRouter(): Router {
  return createRouter({ history: createMemoryHistory(), routes });
}

/**
 * Runs a composable inside a real component context, so `onMounted`,
 * `onUnmounted` and `inject` work. Remember to `app.unmount()` at the end when
 * you want the cleanup hooks to run.
 */
export function withSetup<T>(composable: () => T): [T, App] {
  let result!: T;

  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    },
  });

  app.mount(document.createElement('div'));
  return [result, app];
}
