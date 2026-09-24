import type { RouteRecordRaw } from 'vue-router';

/**
 * Ceremony #1: a file that mirrors the file system, by hand.
 *
 * It has already drifted — two views under `src/views/` have no URL at all, the
 * users layout is not used, and every `name` is something somebody invented.
 *
 * TODO 1.2: delete this file. Move the views into `src/pages/`, named after the
 *   URL they serve, and let the plugin generate the array:
 *
 *     src/pages/index.vue            →  /
 *     src/pages/about.vue            →  /about
 *     src/pages/users.vue            →  the layout, beside the folder
 *     src/pages/users/index.vue      →  /users
 *     src/pages/users/[id].vue       →  /users/:id
 *     src/pages/users.create.vue     →  /users/create, WITHOUT the layout
 *     src/pages/[...path].vue        →  the catch-all
 *
 *   `index.vue` is all lowercase. The dot in `users.create.vue` nests the URL
 *   without nesting the UI.
 */
export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
  { path: '/users', name: 'users', component: () => import('@/views/UsersListView.vue') },
  { path: '/users/:id', name: 'user', component: () => import('@/views/UserView.vue') },
];
