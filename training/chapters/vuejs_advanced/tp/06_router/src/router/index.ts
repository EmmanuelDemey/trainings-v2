import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

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
    component: () => import('@/views/InvoicesView.vue'),
    // TODO 3.1: this list must require authentication.
    meta: { title: 'Invoices' },
  },
  {
    path: '/invoices/:id(\\d+)',
    name: 'invoice',
    component: () => import('@/views/InvoiceView.vue'),
    props: true,
    // TODO 3.1: protected too.
    meta: { title: 'Invoice' },
  },
  {
    path: '/invoices/new',
    name: 'invoice-new',
    component: () => import('@/views/InvoiceFormView.vue'),
    meta: { title: 'New invoice' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    // TODO 4.1: restrict this route to the `admin` role via `meta.roles`.
    meta: { title: 'Administration' },
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

  // TODO 5.1: implement `scrollBehavior(to, from, savedPosition)`:
  //   - restore `savedPosition` on back / forward
  //   - scroll to `to.hash` when there is one (smooth, with an 80px offset)
  //   - otherwise go back to the top
  //   Test it on /invoices, which is deliberately long enough to scroll.
});

// TODO 3.2: global `beforeEach` guard.
//   - call `auth.restoreSession()` before anything else (it is idempotent)
//   - redirect to `{ name: 'login', query: { redirect: to.fullPath } }` when the
//     route has `meta.requiresAuth` and the user is not authenticated
//   - send an authenticated user away from /login
//
// TODO 4.2: extend the guard with a role check based on `meta.roles`, and
//   redirect to `{ name: 'forbidden' }` when it fails.
//
// TODO 6.1: add an `afterEach` that sets `document.title` from `to.meta.title`.
//
// TODO 6.2 (bonus): add a direction-aware transition. In an `afterEach`, compare
//   the depth of `to.path` and `from.path` and set `to.meta.transition` to
//   'slide-left' or 'slide-right'.

// Guards run in App.vue's <RouterView> — see the transition TODOs there.
