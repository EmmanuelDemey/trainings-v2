import { createRouter, createWebHistory, type Router, type RouterHistory } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import TicketsView from '@/views/TicketsView.vue';
import TicketView from '@/views/TicketView.vue';

export const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/tickets', name: 'tickets', component: TicketsView, meta: { requiresAuth: true } },
  { path: '/tickets/:id', name: 'ticket', component: TicketView, meta: { requiresAuth: true } },
] as const;

/**
 * The history is injectable so a spec can hand it `createMemoryHistory()` — a
 * real router, with real guards, and no browser URL to clean up between tests.
 */
export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  const router = createRouter({ history, routes: [...routes] });

  router.beforeEach((to) => {
    const session = useSessionStore();
    if (to.meta.requiresAuth && !session.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
    return true;
  });

  return router;
}
