import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import InvoicesView from '@/views/InvoicesView.vue';
import { useAuthStore } from '@/stores/auth';

/**
 * STEP 3 — routing, guards and code-splitting.
 *
 * `HomeView` and `InvoicesView` stay EAGER: they are where the app starts, and
 * lazy-loading them would only add a round trip between the first paint and the
 * first content. Everything else is a `() => import(...)`, so it becomes its own
 * chunk — count them in `dist/assets/` after `npm run build`.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Sign in' },
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: InvoicesView,
    meta: { title: 'Invoices', requiresAuth: true },
  },
  {
    path: '/invoices/new',
    name: 'invoice-new',
    component: () => import('@/views/InvoiceFormView.vue'),
    // Signed in, and `admin` only: Alan (accountant) lands on /forbidden.
    meta: { title: 'New invoice', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/invoices/:id(\\d+)',
    name: 'invoice',
    component: () => import('@/views/InvoiceView.vue'),
    // Route params are strings; the views want a number.
    props: (route) => ({ id: Number(route.params.id) }),
    meta: { title: 'Invoice', requiresAuth: true },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { title: 'Forbidden' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

/**
 * The single global guard.
 *
 * `useAuthStore()` is called INSIDE the guard, never at module scope: this
 * module is evaluated while `main.ts` is still building the app, before
 * `app.use(pinia)` runs. At module scope there is no active Pinia and the call
 * throws.
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // First, unconditionally. On a hard refresh the store is empty even though
  // the stored session is still valid — skip this and F5 on /invoices logs the
  // user out. It is idempotent, so it costs one boolean on every later hop.
  await auth.restoreSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // `fullPath`, not `path`: the query and hash are part of where they meant
    // to go.
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home' };
  }

  // 403, not 404, and not /login: the user IS authenticated, they simply may
  // not enter. Redirecting to /login would loop, since the guard would bounce
  // them straight back out.
  if (to.meta.roles && !to.meta.roles.some((role) => auth.hasRole(role))) {
    return { name: 'forbidden' };
  }

  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Invoices` : 'Invoices';
});
