import type { RouteRecordRaw } from 'vue-router';
import HomeView from '@/components/HomeView.vue';

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: () => import('@/components/LoginForm.vue') },
  { path: '/invoices', name: 'invoices', component: () => import('@/components/InvoiceList.vue') },
  { path: '/cart', name: 'cart', component: () => import('@/components/CartSummary.vue') },
];
