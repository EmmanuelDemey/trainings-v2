# TP 8 — The `unplugin-*` ecosystem

> This TP is **autonomous**: it does not depend on any other TP. The app works.
> It also carries three kinds of ceremony, and one of them has already drifted:
> two views under `src/views/` exist and no URL reaches them.

## Goal

Chapter 8 — Delete everything a build-time plugin can derive:

- **File-based routing**: `src/pages/` → the `routes` array, plus typed routes
- **`unplugin-auto-import`**: no more `import { ref, computed } from 'vue'`
- **`unplugin-vue-components`**: no more one-import-per-component-used
- And the reason all three generate **real `import` statements**: tree-shaking
  survives, which `app.component()` never allows

> **One difference from the slides.** The chapter teaches
> `unplugin-vue-router`; that package was **merged into Vue Router 5** and is now
> deprecated. This training runs on Vue Router 5, so the plugin comes from the
> router itself — `vue-router/vite`, `vue-router/auto-routes`. The options, the
> file conventions and the generated names are the same; only the import path
> changed. The other two plugins are unchanged.

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Everything is already installed — the work here is **wiring**, not shopping.

`tests/routes.spec.ts` is given and **six of its ten specs are red**. Each red
one names a page the app should serve and does not. They assert on the routes
the app *has*, never on how they got there: a hand-written array and a generated
one are interchangeable — except that one of them drifts.

## Steps

### 1. File-based routing — `vite.config.ts`

```ts
import VueRouter from 'vue-router/vite';

plugins: [
  VueRouter({ routesFolder: 'src/pages' }),
  vue(),        // AFTER: the Vue plugin must see the transformed SFC
]
```

Then move the views into `src/pages/`, named after the URL they serve:

```text
src/pages/index.vue          →  /                 (lowercase, always)
src/pages/about.vue          →  /about
src/pages/users.vue          →  the layout, beside the folder
src/pages/users/index.vue    →  /users
src/pages/users/[id].vue     →  /users/:id
src/pages/users.create.vue   →  /users/create, WITHOUT the layout
src/pages/[...path].vue      →  /:path(.*)        the catch-all
```

Finally, `src/router/index.ts` takes its array from the virtual module:

```ts
import { routes } from 'vue-router/auto-routes';
```

…and `src/router/routes.ts` goes in the bin.

> `users.vue` **beside** `users/` is the parent layout. Delete it and the URLs do
> not move — only the layout goes. The **dot** in `users.create.vue` nests the
> URL without nesting the UI.

### 2. The specs need the plugins too — `vitest.config.ts`

Vitest reads its own config: a plugin added to `vite.config.ts` is invisible to
it, and `vue-router/auto-routes` resolves to nothing. Wire them there as
well — then replace the duplication with `mergeConfig(viteConfig, …)`.

### 3. Auto-imports

```ts
AutoImport({
  imports: ['vue', 'vue-router'],
  dirs: ['src/composables'],
  vueTemplate: true,
  dts: 'src/auto-imports.d.ts',
});
```

Then strip the imports from the pages: `ref`, `computed`, `useRoute`,
`useUsers`. Delete them one at a time and keep `npm run dev` open.

### 4. Auto-registered components

```ts
Components({
  dirs: ['src/components'],
  deep: true,
  directoryAsNamespace: true,
  dts: 'src/components.d.ts',
});
```

`src/components/ui/Button.vue` becomes `<UiButton>`. Strip the component imports
from the pages.

### 5. Commit the generated types

The three plugins write `typed-router.d.ts`, `src/auto-imports.d.ts` and
`src/components.d.ts` **during a build**. `npm run build` runs `vue-tsc`
**first**, so a CI that has never built cannot typecheck: **commit them**, and
add `typed-router.d.ts` to `tsconfig.json`'s `include`.

### 6. Cash in the typed routes

`useRoute()` now returns a **union** of every page's params, so `route.params.id`
no longer compiles — which is the feature. Narrow it per page:

```ts
const route = useRoute('/users/[id]');
```

Then try `useRoute('/users/[oops]')` and read the error.

### 7. *(Bonus)* HMR on the routes

In `main.ts`, behind `import.meta.hot`, call `handleHotUpdate(router)` from
`vue-router/auto-routes`. Rename a page file with the app open and watch the URL
follow without a reload.

> Keep it out of `createAppRouter()`: it talks to the dev server, and the factory
> has to stay callable from a spec.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the ten specs
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src vite.config.ts vitest.config.ts` returns nothing
- [ ] `src/router/routes.ts` and `src/views/` are **gone**

**The routes are generated**

- [ ] `/users` and `/users/:id` render inside the users layout
- [ ] `/users/create` renders **without** it
- [ ] An unknown URL renders the not-found page, with the path in its params
- [ ] The route names are the generated ones — `/users/[id]`, `/users.create`,
      `/[...path]`
- [ ] `vitest.config.ts` shares its plugins with `vite.config.ts`

**The imports are generated**

- [ ] No page imports `ref`, `computed` or `useRoute`
- [ ] No page imports a component from `src/components`
- [ ] `<UiButton>` resolves through `directoryAsNamespace`
- [ ] The three generated `.d.ts` are committed and in `tsconfig.json`

**You can explain**

- [ ] Why the router plugin must come **before** `vue()`
- [ ] Why a generated `import` tree-shakes where `app.component()` does not
- [ ] Why `<component :is="name" />` is out of reach for `unplugin-vue-components`
- [ ] What `users.vue` beside `users/` does, and what deleting it changes
- [ ] What `unplugin` itself buys you over writing a Vite plugin

## Going further

- Add a `definePage({ meta: { requiresAuth: true } })` macro to
  `users.create.vue` and read the meta back from a navigation guard.
- Point `routesFolder` at two folders at once, one of them with a `path` prefix.
- Break it on purpose: put `vue()` **before** the router plugin, and read the
  error you get. That is the one you will meet again in a real project.
- Run `npx vite build` twice, once with `Components()` and once with a
  `app.component()` equivalent, and compare the two bundle sizes.
