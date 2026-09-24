---
layout: cover
---

# 8 - The `unplugin-*` ecosystem

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Distinguish** a **Vue plugin** (runtime, `app.use`) from an **unplugin**
  (build time, `vite.config.ts`), and name the bundlers one transform covers
- **Generate** your `routes` array from `src/pages/` with
  **`unplugin-vue-router`**, wired in the right plugin order
- **Read** the file-name conventions off a folder listing: `index.vue`, `[id]`,
  `[[id]]`, `[slugs]+`, `[...path]`
- **Explain** the file *beside* the folder — nested layouts, and `users.create.vue`
  when you want the URL without the layout
- **Drop** the repetitive `import { ref, computed } from 'vue'` with
  **`unplugin-auto-import`**, configured for Vue, Pinia, Vue Router and your own
  composables
- **Register** components on demand with **`unplugin-vue-components`**, and say why
  a generated `import` tree-shakes where `app.component()` does not

---

# The three kinds of ceremony

```ts
// 1. routes/index.ts — a file that mirrors the file system, by hand
const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  { path: '/invoices', component: () => import('@/views/InvoicesView.vue') },
  { path: '/invoices/:id', component: () => import('@/views/InvoiceView.vue') },
];
```

```vue
<script setup lang="ts">
// 2. The same six imports at the top of every component
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

// 3. …and one import per component used in the template
import InvoiceCard from '@/components/InvoiceCard.vue';
import AppButton from '@/components/ui/AppButton.vue';
</script>
```

> None of this carries information. It is derivable — so a **build-time plugin**
> can derive it.

---

# `unplugin`, the layer underneath

- All three plugins are built on **`unplugin`** — a unified plugin API
- You write the transform **once**, and it runs on **Vite, Rollup, Rolldown,
  webpack, Rspack, esbuild, Farm** — and everything built on top (Nuxt, Quasar,
  Vue CLI, Astro)
- Hence the import path convention: the package name, then the bundler

```ts
import VueRouter from 'unplugin-vue-router/vite';
import VueRouter from 'unplugin-vue-router/webpack';
import VueRouter from 'unplugin-vue-router/rollup';
```

<br />

| Package | Version | What it generates |
|---|---|---|
| `unplugin-vue-router` | 0.19 | the `routes` array + route types |
| `unplugin-auto-import` | 21 | `import` statements for APIs |
| `unplugin-vue-components` | 32 | `import` statements for components |

---

# `unplugin-vue-router` — wiring

```bash
npm i -D unplugin-vue-router
```

```ts
// vite.config.ts
import VueRouter from 'unplugin-vue-router/vite';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',          // default
      dts: './typed-router.d.ts',         // default
      extensions: ['.vue'],
    }),
    Vue(),           // ⚠️ Vue **after** VueRouter — it must see the transformed SFC
  ],
});
```

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';   // virtual module

export const router = createRouter({ history: createWebHistory(), routes });
```

> ⚠️ **Since Vue Router 5, this is built in.** `unplugin-vue-router` has been
> merged into the router and is deprecated: the plugin is now
> `vue-router/vite`, and the virtual module is still `vue-router/auto-routes`.
> The options, the file conventions and the generated names are unchanged — only
> the import path moves. This training runs on Vue Router 5, so
> `tp/08_unplugin/` uses the built-in one.
>
> On Vue Router 4 (>= 4.4), the standalone `unplugin-vue-router` is still the way.

---

# File → route conventions

```text
src/pages/
├── index.vue                 →  /
├── about.vue                 →  /about
├── [...path].vue             →  /:path(.*)          catch-all / 404
└── users/
    ├── index.vue             →  /users
    ├── [id].vue              →  /users/:id
    ├── [[id]].vue            →  /users/:id?         optional
    └── [slugs]+.vue          →  /users/:slugs+      repeatable
```

- `index.vue` must be **all lowercase**
- A param can sit between static segments: `users_[id].vue` → `/users_:id`
- Several params in one file: `product_[skuId]_[seoDescription].vue`
- `[[slugs]]+.vue` → `/:slugs*` (optional **and** repeatable)
- Every route with a `component` gets a **name**, derived from the file path

---

# Nesting: the file *beside* the folder

```text
src/pages/
├── users.vue          ← the layout, holds a <RouterView />
└── users/
    ├── index.vue      → /users
    └── [id].vue       → /users/:id
```

```ts
// generated
[{ path: '/users', component: () => import('src/pages/users.vue'),
   children: [
     { path: '',    component: () => import('src/pages/users/index.vue') },
     { path: ':id', component: () => import('src/pages/users/[id].vue') },
   ] }]
```

- Remove `users.vue` and you keep the **URL nesting** without a layout component
- Need the URL nested but **not** the UI? Use a dot:
  `users.create.vue` → `/users/create`, rendered on its own

---

# `unplugin-auto-import`

```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';

AutoImport({
  imports: [
    'vue',                     // ref, computed, watch, onMounted…
    'pinia',                   // defineStore, storeToRefs…
    VueRouterAutoImports,      // useRoute, useRouter, onBeforeRouteLeave…
    { '@vueuse/core': ['useDebounceFn', ['useFetch', 'useVueFetch']] },
    { from: 'vue-router', imports: ['RouteLocationRaw'], type: true },
  ],
  dirs: ['src/composables/**'],       // our own useX() too
  dts: 'src/auto-imports.d.ts',
  vueTemplate: true,                  // also resolve them inside <template>
  eslintrc: { enabled: true },
});
```

> Use `VueRouterAutoImports` rather than the plain `'vue-router'` preset: it also
> registers the runtime helpers `unplugin-vue-router` needs.

---

# `unplugin-vue-components`

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite';

Components({
  dirs: ['src/components'],        // default
  deep: true,                      // subdirectories too
  dts: 'src/components.d.ts',      // default true when TypeScript is installed
  directives: true,                // v-my-directive resolved the same way
  directoryAsNamespace: true,      // components/ui/Button.vue → <UiButton />
  excludeNames: [/^Async.+/],      // hands off, we register these ourselves
});
```

```vue
<template>
  <UiButton @click="save">Save</UiButton>   <!-- no import, no app.component -->
  <InvoiceCard :invoice="invoice" />
</template>
```

- Resolution is by **name**, from the template — so a component referenced through
  a variable (`<component :is="name" />`) is **not** found

---

# Recap

- `unplugin` = one plugin, every bundler; a **build-time** transform, not an
  `app.use()`
- `unplugin-vue-router`: `src/pages/` → `routes`, plus `typed-router.d.ts` — and
  `Vue()` must come **after** it
- Conventions worth memorising: `index.vue` (lowercase), `[id]`, `[[id]]`,
  `[slugs]+`, `[...path]`, `users_[id].vue`
- `users.vue` **beside** `users/` is the parent layout; delete it and the URLs stay
  the same. `users.create.vue` nests the URL without the layout
- `unplugin-auto-import` and `unplugin-vue-components` write **real imports** —
  tree-shaking survives, unlike `app.component()`
- Components are resolved by **name, from the template** — `<component :is="name" />`
  is out of reach

> The workshop for this chapter is `tp/08_unplugin/`.

---

# Quiz — Question 1 / 2

**`src/pages/users.vue` and `src/pages/users/index.vue` both exist. What does
`/users` render?**

- **A.** `users.vue` only — the file wins over the folder
- **B.** `users/index.vue` only
- **C.** `users.vue`, with `users/index.vue` inside its `<RouterView />`
- **D.** A build error: ambiguous route

<v-click>

> ✅ **C** — The file beside the folder becomes the **parent layout**. Delete it and
> you keep the same URLs with no layout component. Need `/users/create` outside
> that layout? Name it `users.create.vue`.

</v-click>

---

# Quiz — Question 2 / 2

**Why is `unplugin-vue-components` a better default than
`app.component('AppButton', AppButton)`?**

- **A.** It rewrites the SFC to add a real `import`, so unused components are
  tree-shaken out of the bundle
- **B.** It registers components faster at runtime
- **C.** It gives components a `<script setup>` scope
- **D.** It avoids name collisions

<v-click>

> ✅ **A** — A global registration is a runtime side effect: the bundler sees a
> reference to the module and must keep it, used or not. The unplugin produces
> ordinary imports, and ordinary imports are analysable.

</v-click>

