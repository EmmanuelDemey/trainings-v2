---
layout: cover
---

# 6 - Advanced routing with Vue Router

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Declare** named routes and **type** their `meta` fields to make the router
  refactor-safe
- **Configure** the history mode together with the server-side SPA fallback it
  requires
- **Navigate** programmatically by name, with params, query and `replace`
- **Distinguish** the three levels of guards — global, per-route, in-component —
  and what each one may return
- **Protect** routes with a global guard: session restoration, `?redirect=` on the
  way to login, role checks read from `meta`
- **Keep** old URLs alive after a refactor with redirects and aliases

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
- `router.push` returns a **Promise** — `await` it before reading the new route

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

# Recap

- Named routes + typed `meta` make the router refactor-safe
- `createWebHistory` needs an **SPA fallback** on the server; `createWebHashHistory`
  needs nothing, `createMemoryHistory` is for tests and SSR
- Always `push` a **name**, never a path — and `replace` when there is nothing to
  go back to
- Guards: `beforeEach` for auth, `beforeEnter` for route-specific rules,
  `onBeforeRouteUpdate` on a param change, `onBeforeRouteLeave` for unsaved changes
- `afterEach` cannot change a navigation — page title and analytics only
- A **redirect** changes the URL, an **alias** keeps it: that is how indexed links
  survive a refactor

---

# Quiz — Question 1 / 3

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

# Quiz — Question 2 / 3

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

# Quiz — Question 3 / 3

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
layout: cover
---

# Hands-on

## Workshop 6 - Advanced routing
