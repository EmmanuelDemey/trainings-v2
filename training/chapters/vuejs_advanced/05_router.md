---
layout: cover
---

# 5 - Advanced routing with Vue Router

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Declare** named routes and **type** their `meta` fields to make the router
  refactor-safe
- **Navigate** programmatically and **handle** the results: `NavigationFailure`,
  history manipulation, `router.onError`
- **Animate** route changes with `<RouterView v-slot>`, `Transition` and
  `KeepAlive`, and **restore** the scroll position
- **Order** the three levels of guards — global, per-route, in-component — in the
  full resolution sequence
- **Build** a complete authentication flow: guard, `?redirect=`, session
  restoration, logout on a 401
- **Assemble** the route table at runtime with `addRoute` / `removeRoute`, driven
  by the permissions returned by the backend
- **Configure** the history mode together with the server-side SPA fallback

---

# Recap — a typed router

```ts
// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/invoices/:id',
    name: 'invoice',
    component: () => import('@/views/InvoiceView.vue'),   // lazy chunk
    props: true,                                          // params ➜ props
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
```

- `props: true` decouples the view from `useRoute()` — much easier to test

---

# Typed `meta` fields

```ts
// router/types.d.ts
import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: Array<'admin' | 'user'>;
    layout?: 'default' | 'blank';
    transition?: string;
  }
}
```

- Now `to.meta.requiresAuth` is **typed everywhere**, guards included
- A typo in a `meta` key becomes a compile error

> Vue Router 4.5 also ships **typed routes** (route names and params inferred)
> via `unplugin-vue-router`.

---

# History modes

```ts
createWebHistory()        // /invoices/42       — needs a server fallback
createWebHashHistory()    // /#/invoices/42     — works on any static host
createMemoryHistory()     // no URL             — SSR and tests
```

<br />

`createWebHistory` requires the server to serve `index.html` for unknown paths:

```
# Netlify _redirects
/*    /index.html   200
```

```nginx
location / { try_files $uri $uri/ /index.html; }
```

- Forget this and every **hard refresh** on a deep link returns a 404

---

# Programmatic navigation

```ts
import { useRouter } from 'vue-router';

const router = useRouter();

router.push('/invoices');                              // string path
router.push({ name: 'invoice', params: { id: '42' } }); // named route (preferred)
router.push({ path: '/search', query: { q: 'vue' } });
router.push({ hash: '#section-2' });

router.replace({ name: 'login' });   // no new history entry
```

- **Always prefer named routes**: paths change, names don't
- `router.push` returns a **Promise** resolving to a `NavigationFailure` or `undefined`

---

# Handling navigation results

```ts
import { isNavigationFailure, NavigationFailureType } from 'vue-router';

const failure = await router.push({ name: 'checkout' });

if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  toast('Navigation cancelled — you have unsaved changes');
}
```

| Type | Meaning |
|---|---|
| `aborted` | A guard returned `false` |
| `cancelled` | A newer navigation started before this one finished |
| `duplicated` | Already on that exact location |

- An **unhandled** rejection here is a very common source of silent bugs
- `router.onError()` catches errors thrown inside guards and lazy component loaders

---

# Manipulating history

```ts
router.go(-1);        // back
router.go(1);         // forward
router.back();
router.forward();
```

<br />

```ts
// Reading the current location
import { useRoute } from 'vue-router';

const route = useRoute();          // reactive, do NOT destructure
watch(() => route.params.id, load, { immediate: true });
```

- `route` is a **reactive object** — `const { params } = useRoute()` loses reactivity
- The same component instance is **reused** across `/invoices/1` ➜ `/invoices/2`:
  `onMounted` will not run again. Watch the param, or add `:key="route.fullPath"`

---

# Scroll behaviour

```ts
createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;          // back/forward: restore
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 };
    if (to.name === from.name) return false;          // same view: don't scroll
    return { top: 0 };
  },
});
```

- Returning a **Promise** delays the scroll — useful with transitions:

```ts
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(savedPosition ?? { top: 0 }), 300);
  });
}
```

---

# Route transitions

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
```

- `mode="out-in"` — the old view leaves **before** the new one enters
- `:key` forces a real transition even between two routes sharing a component

---

# Per-route transitions

```ts
{ path: '/settings', component: SettingsView, meta: { transition: 'slide-left' } }
```

```vue
<RouterView v-slot="{ Component, route }">
  <Transition :name="(route.meta.transition as string) ?? 'fade'" mode="out-in">
    <component :is="Component" />
  </Transition>
</RouterView>
```

Direction-aware transitions:

```ts
router.afterEach((to, from) => {
  const depth = (path: string): number => path.split('/').length;
  to.meta.transition = depth(to.path) < depth(from.path) ? 'slide-right' : 'slide-left';
});
```

---

# Keeping views alive

```vue
<RouterView v-slot="{ Component }">
  <Transition name="fade" mode="out-in">
    <KeepAlive :include="['SearchView', 'ListView']" :max="5">
      <component :is="Component" />
    </KeepAlive>
  </Transition>
</RouterView>
```

- `KeepAlive` caches the instance: scroll position, form state and fetched data survive
- The component must have a **`name`** (`defineOptions({ name: 'SearchView' })`)
- Cached components get `onActivated` / `onDeactivated` instead of mount/unmount
- ⚠️ Memory: always bound the cache with `:max`

---

# View Transitions API

```ts
router.beforeResolve((to, from, next) => {
  if (!document.startViewTransition) return next();
  document.startViewTransition(() => new Promise<void>((resolve) => {
    next();
    nextTick(resolve);
  }));
});
```

```css
::view-transition-old(root) { animation: fade-out 0.2s; }
::view-transition-new(root) { animation: fade-in  0.2s; }
```

- Native, GPU-accelerated, can morph shared elements across routes
- Progressive enhancement: **feature-detect** and fall back to `<Transition>`

---

# Navigation guards — the three levels

<br />

| Level | Hooks |
|---|---|
| **Global** | `beforeEach`, `beforeResolve`, `afterEach` |
| **Per-route** | `beforeEnter` |
| **In-component** | `onBeforeRouteUpdate`, `onBeforeRouteLeave` |

<br />

Every guard can:

- return `true` / `undefined` ➜ **continue**
- return `false` ➜ **abort** (URL reverts)
- return a **route location** ➜ **redirect**
- return a **Promise** of any of the above

---

# Global guards

```ts
router.beforeEach(async (to, from) => {
  const auth = useAuthStore();

  if (!auth.initialized) await auth.restoreSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.roles && !to.meta.roles.some((r) => auth.roles.includes(r))) {
    return { name: 'forbidden' };
  }
});

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'App'} — Sparks`;
  analytics.pageView(to.fullPath);
});
```

- `afterEach` **cannot** change the navigation — it's for side effects only

---

# The full resolution order

1. Navigation triggered
2. `beforeRouteLeave` in deactivated components
3. Global `beforeEach`
4. `beforeRouteUpdate` in reused components
5. `beforeEnter` on the route record
6. **Async route components are resolved**
7. `beforeRouteEnter` in activated components
8. Global `beforeResolve`
9. Navigation confirmed
10. Global `afterEach`
11. DOM updated, then `beforeRouteEnter`'s `next(vm => ...)` callbacks

> `beforeResolve` is the right place for work needing the **resolved** components
> (permissions declared by the component, data prefetch, camera permissions...).

---

# Per-route and in-component guards

```ts
{
  path: '/admin',
  component: AdminView,
  beforeEnter: [requireAuth, requireRole('admin')],   // array = composable guards
}
```

```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

onBeforeRouteLeave((to, from) => {
  if (form.isDirty && !confirm('Discard your changes?')) return false;
});

onBeforeRouteUpdate(async (to) => {
  // same component, different params: reload the data
  await loadInvoice(to.params.id as string);
});
</script>
```

- `beforeEnter` only fires when **entering** the route, not on param changes

---

# Redirects and aliases

```ts
{ path: '/home', redirect: { name: 'dashboard' } },

{ path: '/old/:id', redirect: (to) => ({ name: 'invoice', params: to.params }) },

{ path: '/dashboard', component: Dashboard, alias: ['/', '/overview'] },

{
  path: '/users',
  component: UsersLayout,
  children: [
    { path: '', redirect: { name: 'users-list' } },     // default child
    { path: 'list', name: 'users-list', component: UsersList },
  ],
},
```

- **Redirect** changes the URL; **alias** keeps it while rendering the same component
- Use redirects to keep old, indexed URLs alive after a refactor

---

# Case study — authentication

The pieces:

1. A **Pinia store** holding the user, the token and the roles
2. A **global guard** protecting routes flagged `meta.requiresAuth`
3. A **login view** honouring the `?redirect=` query
4. **Session restoration** before the first guarded navigation
5. An **HTTP interceptor** that logs out on `401`
6. **Route-level role checks** driven by `meta.roles`

---

# Case study — the store

```ts
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = useLocalStorage<string | null>('token', null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => user.value !== null);
  const roles = computed(() => user.value?.roles ?? []);

  async function login(email: string, password: string): Promise<void> {
    const res = await api.post<{ token: string; user: User }>('/login', { email, password });
    token.value = res.token;
    user.value = res.user;
  }

  async function restoreSession(): Promise<void> {
    if (token.value) {
      try { user.value = await api.get<User>('/me'); } catch { token.value = null; }
    }
    initialized.value = true;
  }

  function logout(): void { user.value = null; token.value = null; }

  return { user, token, initialized, isAuthenticated, roles, login, restoreSession, logout };
});
```

---

# Case study — the guard and the login view

```ts
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.initialized) await auth.restoreSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' };            // already logged in
  }
});
```

```ts
// LoginView.vue
async function onSubmit(): Promise<void> {
  await auth.login(email.value, password.value);
  const redirect = route.query.redirect;
  await router.replace(typeof redirect === 'string' ? redirect : { name: 'dashboard' });
}
```

- ⚠️ Validate `redirect` is a **relative path** — an open redirect is a real vulnerability

---

# Case study — logging out on 401

```ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore();
      auth.logout();
      await router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    }
    return Promise.reject(error);
  },
);
```

<br />

> Guards protect the **UI**, never the **data**. Every protected route must map to
> an endpoint that enforces the same rule server-side. A guard is a UX feature.

---

# Dynamic routes — when the table is not known at build time

A static table plus a `meta.roles` guard covers most applications. It stops being
enough when:

- Permissions come from the **backend**, per user or per tenant — not a fixed
  role enum frozen in the bundle
- Whole **modules** are sold as options: a customer without the billing module
  should never download its chunk, nor see it in the menu
- The route table is itself **data**: a plugin, a remote module or a
  micro-frontend registers its own screens at runtime

<br />

> The router exposes a **mutable** matcher: `addRoute`, `removeRoute`,
> `hasRoute`, `getRoutes`.

---

# Static + guard vs. dynamic table

| | Static table + guard | `addRoute` after login |
|---|---|---|
| Route table | known at build time | assembled per user |
| Forbidden route | matches, then guard redirects to `/forbidden` | **does not match** ➜ falls into the 404 |
| Menu | filter on `meta` | the table *is* the menu |
| Payload | every chunk is referenced | unreachable modules are never requested |
| Complexity | one guard | bootstrap, teardown, tests |

<br />

- Start static. Go dynamic when permissions become **data**, not an enum
- The two combine: dynamic routes still carry `meta.requiresAuth`

---

# The matcher API

```ts
const stop = router.addRoute({           // ➜ returns its own remover
  path: '/invoices',
  name: 'invoices',
  component: () => import('@/modules/invoices/InvoicesView.vue'),
  meta: { requiresAuth: true },
});

router.addRoute('settings', { path: 'billing', name: 'billing', component: Billing });
                // ^ name of the parent record ➜ adds a nested route

router.removeRoute('invoices');   // also removes its children and its aliases
router.hasRoute('invoices');      // ➜ boolean
router.getRoutes();               // ➜ RouteRecordNormalized[] (a snapshot)

stop();                           // same as removeRoute('invoices')
```

- `addRoute` **never navigates** — it only changes what *would* match next time
- Adding a route whose `name` already exists **silently replaces** the previous
  record: double registration is invisible without a `hasRoute` check

---

# Insertion order does not matter

```ts
router.addRoute({ path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound });
router.addRoute({ path: '/invoices/:id',    name: 'invoice',   component: Invoice });

// /invoices/42 still matches `invoice`, not `not-found`
```

- Vue Router 4 **ranks** records by score and inserts each one at its ranked
  position: a static segment beats a param, a param beats a repeated wildcard
- The catch-all has the lowest possible score, so it stays last **whatever the
  order** in which you add routes
- The Vue Router 3 habit of "always register the 404 last" is obsolete

> Only records with the **same score** fall back to insertion order —
> `/:a` added before `/:b` wins. Two routes tied on score are a modelling bug.

---

# The trap — the current navigation is already resolved

```
   URL /invoices  (routes not registered yet)
        │
        ▼
   ┌──────────────────────────────┐
   │  resolve  ➜  `to` = 404      │  ① the match is computed *before* the guard
   └──────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────┐
   │  beforeEach ➜ addRoute(...)  │  ② the table now contains /invoices
   └──────────────────────────────┘     but `to` still points at the 404 record
        │
        ├── return true      ➜ renders the 404  ❌
        ├── return to        ➜ renders the 404  ❌  (already-resolved location)
        └── return to.fullPath ➜ resolve again ➜ /invoices  ✅
```

- Returning the **string** forces the router to re-run the matcher against the
  new table; returning `to` hands back a stale, already-resolved match

---

# The module map — permissions to routes

```ts
// router/modules.ts
import type { RouteRecordRaw } from 'vue-router';

export type Permission = 'invoices:read' | 'admin:users' | 'reports:read';

export const MODULES: Record<Permission, RouteRecordRaw[]> = {
  'invoices:read': [
    { path: '/invoices', name: 'invoices', component: () => import('@/modules/invoices/List.vue'),
      meta: { requiresAuth: true, permission: 'invoices:read', nav: { label: 'Invoices', order: 10 } } },
    { path: '/invoices/:id', name: 'invoice', props: true,
      component: () => import('@/modules/invoices/Detail.vue'),
      meta: { requiresAuth: true, permission: 'invoices:read' } },
  ],
  'admin:users': [/* ... */],
  'reports:read': [/* ... */],
};
```

- One **declarative** map, one source of truth for the router *and* the menu
- Extend `RouteMeta` with `permission?: Permission` and `nav?: { label: string; order: number }`

---

# Registering and tearing down

```ts
// router/dynamic.ts
import { ref } from 'vue';
import type { Router } from 'vue-router';
import { router } from './index';
import { MODULES, type Permission } from './modules';

let removers: Array<() => void> = [];
export const synced = ref(false);                      // flag *and* reactive dep

export function syncRoutes(permissions: Permission[], target: Router = router): void {
  resetRoutes();
  for (const permission of permissions) {
    for (const route of MODULES[permission] ?? []) {
      if (target.hasRoute(route.name!)) continue;      // HMR, double bootstrap
      removers.push(target.addRoute(route));
    }
  }
  synced.value = true;
}

export function resetRoutes(): void {
  removers.forEach((remove) => remove());
  removers = [];
  synced.value = false;
}
```

- Keep the **removers**: they undo exactly what you added, including the records
  you registered **without a `name`** — those cannot be removed any other way

---

# The bootstrap guard

```ts
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.initialized) await auth.restoreSession();     // ① who is it?

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (auth.isAuthenticated && !synced.value) {            // ② build the table
    syncRoutes(auth.permissions);
    return to.fullPath;                                   // ③ resolve again
  }
});
```

- `restoreSession` runs **before** the sync — on a hard refresh the permissions
  are not in memory yet
- `return to.fullPath` re-enters `beforeEach`, but `synced` is now `true`:
  no loop
- Anything reached by `router.push` **after** the bootstrap needs no special case

---

# Logging out — order matters

```ts
async function logout(): Promise<void> {
  auth.logout();
  await router.replace({ name: 'login' });   // ① leave the dynamic area first
  resetRoutes();                             // ② then shrink the table
}
```

- `removeRoute` does **not** unmount anything: the current view stays on screen
  until the next navigation, now backed by a record that no longer exists
- Any `<RouterLink :to="{ name: 'invoices' }">` still rendered then throws
  *"No match for {name: invoices}"*
- Same sequence when switching tenant or when a token refresh returns a
  **narrower** permission set

---

# The menu is a projection of the table

```ts
const links = computed(() => {
  synced.value;                                   // ⬅ the only reactive dependency
  return router.getRoutes()
    .filter((r) => r.meta.nav)
    .sort((a, b) => a.meta.nav!.order - b.meta.nav!.order);
});
```

- `getRoutes()` returns a **snapshot**: mutating the matcher triggers no
  reactivity at all — without that first line the menu never refreshes
- On normalized records `meta` is the record's **own** meta; the merge with the
  parents only happens on the resolved `route.meta`
- Simpler and safer: build the menu from `MODULES` and the permission list —
  the same source of truth, already reactive

---

# Testing a dynamic router

```ts
function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes: baseRoutes });
}

it('keeps an invoice URL on the 404 when the permission is missing', async () => {
  const router = makeRouter();
  syncRoutes([], router);
  await router.push('/invoices/42');
  expect(router.currentRoute.value.name).toBe('not-found');
});

it('matches the invoice route once the permission is granted', async () => {
  const router = makeRouter();
  syncRoutes(['invoices:read'], router);
  await router.push('/invoices/42');
  expect(router.currentRoute.value.name).toBe('invoice');
});
```

- A module-scope router is **shared state**: build a fresh one per test, and take
  the router as a parameter rather than importing the singleton

---

# Dynamic routes — pitfalls

| Symptom | Cause |
|---|---|
| The 404 shows on the first deep link | the guard returned `true` or `to` instead of `to.fullPath` |
| Infinite redirect | the sync runs on **every** navigation — flag it |
| The same screen registered twice | no `hasRoute` check — the second `addRoute` silently replaced the first |
| A user sees another user's screens after logout | `resetRoutes()` never ran |
| Green in tests, broken in the app | the test reused the singleton router |
| One request leaks routes to the next (SSR) | one router per request, created inside the app factory |

<br />

> The chunk of a module you did not register is **still served** by your CDN.
> Dynamic routes buy payload and UX, never access control.

---

# Recap

- Named routes + typed `meta` make the router refactor-safe
- `createWebHistory` needs an **SPA fallback** on the server
- `route` is reactive: watch params, don't rely on `onMounted`
- `<RouterView v-slot>` unlocks `Transition`, `KeepAlive` and per-route animations
- Guards: `beforeEach` for auth, `beforeEnter` for route-specific rules,
  `onBeforeRouteLeave` for unsaved changes
- Handle `NavigationFailure` and `router.onError` — silent failures are the norm otherwise
- `addRoute` builds the table from the permissions — return **`to.fullPath`** from
  the guard, and `removeRoute` everything on logout

---

# Quiz — Question 1 / 5

**In-app navigation works, but a hard refresh on `/invoices/42` returns a 404. Why?**

- **A.** The route is missing `props: true`
- **B.** The server has no SPA fallback serving `index.html` for unknown paths
- **C.** `scrollBehavior` is not configured
- **D.** The route component is lazy loaded

<v-click>

> ✅ **B** — With `createWebHistory`, the browser really asks the server for
> `/invoices/42`. Add `try_files $uri /index.html` (nginx) or the `/*  /index.html  200`
> Netlify redirect — or fall back to `createWebHashHistory`.

</v-click>

---

# Quiz — Question 2 / 5

**Navigating from `/invoices/1` to `/invoices/2`, same route record. What runs?**

- **A.** `onMounted`, so loading the data there is enough
- **B.** `beforeEnter`, so the route-level guard can reload the data
- **C.** Neither — the instance is reused; watch the param or key the view
- **D.** The component is unmounted and remounted automatically

<v-click>

> ✅ **C** — `beforeEnter` only fires when *entering* the route. Use
> `watch(() => route.params.id, load, { immediate: true })`, `onBeforeRouteUpdate`,
> or force a new instance with `:key="route.fullPath"`.

</v-click>

---

# Quiz — Question 3 / 5

**Which guard cannot change the outcome of a navigation?**

- **A.** `beforeEach`
- **B.** `beforeEnter`
- **C.** `onBeforeRouteLeave`
- **D.** `afterEach`

<v-click>

> ✅ **D** — `afterEach` runs once the navigation is confirmed: it is for side
> effects only (page title, analytics). Returning a location from it does nothing.

</v-click>

---

# Quiz — Question 4 / 5

**Your login view redirects to `route.query.redirect` after a successful login.
What must you check first?**

- **A.** That the value is URL-encoded
- **B.** That the value is a relative path — otherwise you ship an open redirect
- **C.** Nothing: Vue Router refuses external URLs
- **D.** That the target route carries `meta.requiresAuth`

<v-click>

> ✅ **B** — `?redirect=https://evil.example` would send a freshly authenticated user
> straight to an attacker's page. And remember: guards protect the **UI**, never the
> **data** — the server must enforce the same rules.

</v-click>

---

# Quiz — Question 5 / 5

**Routes are registered in `beforeEach` with `addRoute`. A deep link on
`/invoices` still lands on the 404 page. What is missing?**

- **A.** The catch-all route was declared before `/invoices`
- **B.** The guard must return `to.fullPath` so the router resolves again
- **C.** `addRoute` has to be called before `createRouter`
- **D.** The route component must not be lazy loaded

<v-click>

> ✅ **B** — `to` was resolved *before* the guard ran: it still points at the
> catch-all record. Returning the string re-runs the matcher against the new
> table. **A** is a Vue Router 3 reflex: v4 ranks routes by score, so the
> catch-all stays last however late you add the others.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 5 - Advanced routing
- Add a fade **transition** between routes, plus a direction-aware slide driven by
  `meta.transition`
- Implement **`onBeforeRouteLeave`** to block navigation away from a dirty form
- Build the **auth flow**: store, `beforeEach` guard, `?redirect=` handling and
  session restoration
- Add a **role-based** route (`meta.roles`) and a `/forbidden` view
- Register the `/admin` module with **`addRoute`** from the permissions returned
  at login, and remove it on logout
- Restore the **scroll position** on back/forward, and reset it on a new route

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
