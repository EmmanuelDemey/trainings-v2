import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import InvoicesView from '@/views/InvoicesView.vue';
import InvoiceFormView from '@/views/InvoiceFormView.vue';

/**
 * STEP 3 — routing, guards and code-splitting.
 *
 * Everything here is eagerly imported and wide open. Chapters 5 and 9 both have
 * an opinion about that.
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
    // TODO 3.1: this view is the entry point of the app, keep it eager. The two
    //   below are not: make them lazy and check, in step 7, that each one ends
    //   up in its own chunk.
    component: InvoicesView,
    // TODO 3.2: signed-in users only.
    meta: { title: 'Invoices' },
  },
  {
    path: '/invoices/new',
    name: 'invoice-new',
    component: InvoiceFormView,
    // TODO 3.2 + 3.3: signed in, and `admin` only — Alan must not reach it.
    meta: { title: 'New invoice' },
  },
  {
    path: '/invoices/:id(\\d+)',
    name: 'invoice',
    component: () => import('@/views/InvoiceView.vue'),
    // Route params are strings; the views want a number.
    props: (route) => ({ id: Number(route.params.id) }),
    // TODO 3.2: signed-in users only.
    meta: { title: 'Invoice' },
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

// TODO 3.4: the global `beforeEach` guard.
//   - `await auth.restoreSession()` first — it is idempotent, and without it a
//     hard refresh on /invoices bounces a signed-in user to /login
//   - `meta.requiresAuth` + anonymous → `{ name: 'login', query: { redirect: to.fullPath } }`
//   - `meta.roles` + missing role → `{ name: 'forbidden' }`
//   - an already-signed-in user asking for /login goes home
//   Import the store INSIDE the guard, not at module scope: Pinia is not
//   installed yet when this module is evaluated.
//
// TODO 3.5: an `afterEach` that sets `document.title` from `to.meta.title`.
