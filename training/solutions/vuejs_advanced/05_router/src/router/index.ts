import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import { useAuthStore } from '@/stores/auth';

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
    meta: { title: 'Invoices', requiresAuth: true },
  },
  {
    // `/invoices/new` is declared AFTER this one but still wins, because the
    // `(\d+)` constraint makes 'new' unmatchable here. Drop the constraint and
    // the order suddenly matters — a good thing to try once.
    path: '/invoices/:id(\\d+)',
    name: 'invoice',
    component: () => import('@/views/InvoiceView.vue'),
    props: true,
    meta: { title: 'Invoice', requiresAuth: true },
  },
  {
    path: '/invoices/new',
    name: 'invoice-new',
    component: () => import('@/views/InvoiceFormView.vue'),
    meta: { title: 'New invoice', requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Administration', requiresAuth: true, roles: ['admin'] },
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

  /**
   * Reproduce what a browser does for a plain document — the thing an SPA
   * breaks by default.
   */
  scrollBehavior(to, _from, savedPosition) {
    // Back / forward: put the user back exactly where they were. This is the
    // one case where guessing is wrong and the browser already knows.
    if (savedPosition) return savedPosition;

    // A hash: scroll to the anchor, offset by the sticky header's height.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 };
    }

    // A new page starts at the top. Without this, following a link from the
    // bottom of a long list drops you into the middle of the next page.
    return { top: 0 };
  },
});

/**
 * The single global guard. Everything it does is ordered on purpose.
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // FIRST, and unconditionally. On a hard refresh the store is empty even
  // though the token in localStorage is still valid; skip this and every
  // protected page bounces to /login on F5. `restoreSession` is idempotent, so
  // it costs one boolean check on every later navigation.
  await auth.restoreSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // `to.fullPath`, not `to.path`: the query string and hash are part of where
    // the user was trying to go.
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // An authenticated user has no business on the login page — and landing there
  // from a bookmark should not look like a logout.
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home' };
  }

  // 403, not 404: the user IS authenticated, they simply may not enter. Sending
  // them back to /login would be a loop, since they are already signed in.
  if (to.meta.roles && !to.meta.roles.some((role) => auth.hasRole(role))) {
    return { name: 'forbidden' };
  }

  return true;
});

router.afterEach((to, from) => {
  document.title = to.meta.title ? `${to.meta.title} — TP 5` : 'TP 5';

  // Direction-aware transitions (bonus): going deeper slides left, coming back
  // slides right. Comparing segment counts is crude and good enough — the
  // alternative, tracking history index, breaks on a direct URL entry.
  const depth = (path: string): number => path.split('/').filter(Boolean).length;
  to.meta.transition = depth(to.path) < depth(from.path) ? 'slide-right' : 'slide-left';
});
