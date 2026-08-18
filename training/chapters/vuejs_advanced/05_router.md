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

# Recap

- Named routes + typed `meta` make the router refactor-safe
- `createWebHistory` needs an **SPA fallback** on the server
- `route` is reactive: watch params, don't rely on `onMounted`
- `<RouterView v-slot>` unlocks `Transition`, `KeepAlive` and per-route animations
- Guards: `beforeEach` for auth, `beforeEnter` for route-specific rules,
  `onBeforeRouteLeave` for unsaved changes
- Handle `NavigationFailure` and `router.onError` — silent failures are the norm otherwise

---

# Quiz — Question 1 / 4

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

# Quiz — Question 2 / 4

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

# Quiz — Question 3 / 4

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

# Quiz — Question 4 / 4

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
- Restore the **scroll position** on back/forward, and reset it on a new route

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
