---
layout: cover
---

# Annexe — The unplugin-* ecosystem

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

---

# What an unplugin actually looks like

```ts
import { createUnplugin } from 'unplugin';

export const stripTodos = createUnplugin<Options | undefined>((options) => ({
  name: 'strip-todos',
  enforce: 'pre',                                   // before the Vue SFC compiler

  transformInclude: (id) => id.endsWith('.vue'),    // cheap filter, runs first
  transform: (code, id) => ({ code: code.replace(/\/\/ TODO.*$/gm, ''), map: null }),

  resolveId: (id) => (id === 'virtual:routes' ? '\0virtual:routes' : null),
  load: (id) => (id === '\0virtual:routes' ? 'export const routes = []' : null),

  vite: { configureServer(server) { /* bundler-specific escape hatch */ } },
}));
```

- `resolveId` + `load` is how a **virtual module** like `vue-router/auto-routes`
  exists without a file on disk
- The `vite` / `webpack` / `rspack` keys are the escape hatch when the unified API
  is not enough

---

# Two plugin systems, don't mix them up

|  | Vue plugin (chapter 4) | unplugin |
|---|---|---|
| Registered in | `main.ts`, `app.use(...)` | `vite.config.ts`, `plugins: [...]` |
| Runs at | **runtime**, once per app | **build time**, once per module |
| Sees | the `App` instance | the source code as a string |
| Cost | ships in the bundle | disappears after the build |
| Typical output | `provide`, global component | rewritten `import` statements |

<br />

```ts
// Same feature, two costs
app.component('AppButton', AppButton);      // global: always in the bundle
// vs
Components({ dirs: ['src/components'] });   // adds a real import, only where used
```

> This is the concrete answer to the "**global components — the cost**" slide of
> chapter 4.

---

# The three files you must not forget

```json
// tsconfig.json — the generated types are only picked up if included
{
  "include": ["src/**/*", "src/**/*.vue", "./typed-router.d.ts"],
  "compilerOptions": { "moduleResolution": "Bundler" }
}
```

```ts
// env.d.ts
/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
```

```json
// eslint config — the virtual module is not resolvable on disk
{ "settings": { "import/core-modules": ["vue-router/auto-routes"] },
  "globals": { "definePage": "readonly" } }
```

> `typed-router.d.ts` is written on the **first dev server or build run**. On a
> fresh clone, `vue-tsc` fails until then — commit the file, or build before you
> typecheck (we come back to this).

---

# Two ways to organise without touching the URL

```text
src/pages/
├── (marketing)/              parentheses: the folder vanishes from the path
│   ├── pricing.vue           →  /pricing
│   └── contact.vue           →  /contact
└── admin/
    ├── (dashboard).vue       →  /admin      (equivalent to index.vue)
    └── settings.vue          →  /admin/settings
```

**Named views** — append `@` and the view name:

```text
src/pages/index@aux.vue   →  { path: '/', component: { aux: () => import(...) } }
```

> An unnamed route is named `default`: `index.vue` + `index@aux.vue` is the same
> as `index@default.vue` + `index@aux.vue`.

---

# `definePage()` — meta, next to the page

```vue
<!-- src/pages/invoices/[id].vue -->
<script setup lang="ts">
definePage({
  alias: ['/facture/:id'],
  meta: {
    requiresAuth: true,        // typed by our `declare module 'vue-router'`
    roles: ['admin'],
  },
});

const route = useRoute('/invoices/[id]');   // params typed as { id: string }
</script>
```

- A **global macro**, extracted at build time — no runtime cost, no import needed
- ⚠️ **No variables inside**: the argument is ripped out of `<script setup>`, so it
  cannot reference anything from the module scope
- Declare it to ESLint as a global (previous slide)

---

# The `<route>` block, and build-time edits

```vue
<route lang="json">
{ "name": "invoice-detail", "meta": { "requiresAuth": true } }
</route>
```

- Also `lang="yaml"`; the default is JSON5. Mostly there to ease migration from
  `vite-plugin-pages`

```ts
// vite.config.ts — programmatic edits, still reflected in typed-router.d.ts
VueRouter({
  extendRoute(route) {
    if (route.name === '/admin') route.addAlias('/administration');
  },
  beforeWriteFiles(root) {
    root.insert('/from-config', resolve(__dirname, './src/pages/index.vue'));
  },
});
```

> Prefer `definePage()` (co-located, typed) over `<route>` (stringly-typed) for
> anything new.

---

# What the types actually buy you

```ts
router.push('/users/42');            // ❌ path not in the map → compile error
router.push({ name: '/users/[id]', params: { id: '42' } });  // ✅ params checked

const route = useRoute('/users/[id]');
route.params.id;                     // string
route.params.nope;                   // ❌ compile error
```

```ts
// typed-router.d.ts (generated) — the interface everything reads
export interface RouteNamedMap {
  '/users/[id]': RouteRecordInfo<'/users/[id]', '/users/:id',
    { id: ParamValue<true> }, { id: ParamValue<false> }, never>;
}
```

- Renaming `pages/users/[id].vue` breaks the build **where the route is used**
- Routes added at runtime can be declared by augmenting `RouteNamedMap` yourself

---

# Status: it is being absorbed by Vue Router

- `unplugin-vue-router` has been **merged into `vuejs/router`** — issues and
  contributions now live there
- File-based routing and typed routes are **stable**; the package still ships
  **experimental** APIs under the same version number
- The clearly experimental one: **Data Loaders**

```ts
// src/pages/users/[id].vue
export const useUser = defineBasicLoader('/users/[id]', (route) =>
  fetchUser(route.params.id),
);
```

- Fetching moves **into the navigation** (no waterfall, no flash of empty state),
  and `defineColadaLoader` plugs it into Pinia Colada (chapter 9)
- ⚠️ Pin the version and read the changelog before upgrading

---

# Before / after

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDebouncedSearch } from '@/composables/useDebouncedSearch';

const route = useRoute();
const query = ref('');
const results = useDebouncedSearch(query);
const isEmpty = computed(() => results.value.length === 0);
</script>
```

```vue
<script setup lang="ts">
const route = useRoute();
const query = ref('');
const results = useDebouncedSearch(query);
const isEmpty = computed(() => results.value.length === 0);
</script>
```

- The transform **adds a real `import`** — no global, still tree-shaken
- Under the hood: **`unimport`**, the same engine that powers Nuxt's auto-imports

---

# Keeping the tools happy

```ts
// src/auto-imports.d.ts — generated
declare global {
  const ref: typeof import('vue')['ref'];
  const useRoute: typeof import('vue-router')['useRoute'];
}
```

- **TypeScript**: `dts` on, and the file **inside** `tsconfig.json`'s `include`
- **ESLint**: `eslintrc: { enabled: true }` writes `.eslintrc-auto-import.json`
  with the globals

```js
// eslint.config.js (flat config)
import autoImports from './.eslintrc-auto-import.json' with { type: 'json' };

export default [
  { languageOptions: { globals: autoImports.globals } },
];
```

> With TypeScript, the simplest fix is to **turn `no-undef` off** — `vue-tsc`
> already catches undefined identifiers, and the rule is noisy on TS anyway.

---

# Resolvers — a UI library, on demand

```ts
import { ElementPlusResolver, PrimeVueResolver } from 'unplugin-vue-components/resolvers';

Components({
  resolvers: [
    ElementPlusResolver(),
    (name) => (name.startsWith('Acme') ? { name: name.slice(4), from: '@acme/ui' } : undefined),
  ],
  types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
});
```

- A resolver maps a **name in the template** to an `import` — `<ElButton />`
  becomes `import { ElButton } from 'element-plus'`, and only that one
- The alternative used to be `app.use(ElementPlus)`: the **whole** library in the
  bundle, tree-shaking impossible
- `types` only declares types for components someone else registers globally
  (`RouterView`), so Volar stops complaining

---

# The three, wired together

```ts
// vite.config.ts
export default defineConfig({
  plugins: [
    VueRouter({ routesFolder: 'src/pages', dts: './typed-router.d.ts' }),
    AutoImport({ imports: ['vue', 'pinia', VueRouterAutoImports],
                 dirs: ['src/composables/**'], dts: 'src/auto-imports.d.ts',
                 vueTemplate: true, eslintrc: { enabled: true } }),
    Components({ dts: 'src/components.d.ts' }),
    Vue(),                            // always last of the four
  ],
});
```

```text
src/
├── auto-imports.d.ts     generated   ─┐
├── components.d.ts       generated    ├─ 3 files nobody writes
└── ../typed-router.d.ts  generated   ─┘
```

> Order matters once: **`Vue()` after `VueRouter()`**. The other two are
> insensitive to it.

---

# Generated files: commit them or not?

| | Commit them | `.gitignore` them |
|---|---|---|
| Fresh clone | `vue-tsc` works immediately | fails until a build ran |
| CI | one step: `typecheck` | needs `vite build` (or `dev`) **before** `vue-tsc` |
| Diffs | noisy, conflicts on renames | none |
| Review | you see routes appear in the PR | invisible |

<br />

```yaml
# If you gitignore them, the pipeline of chapter 16 grows a step
- run: npx vite build          # or: npx vue-tsc --noEmit && npx vite build → wrong order
- run: npm run typecheck
```

> **Recommendation**: commit them. The diff noise is the cheap problem; a red CI
> that nobody can reproduce locally is the expensive one.

---

# Tests need the same build

```ts
// vitest.config.ts — a separate config silently loses the plugins
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: { environment: 'happy-dom', globals: true },
}));
```

- Without the plugins, a test fails at runtime with `ref is not defined`, or
  `Failed to resolve import "vue-router/auto-routes"`
- Vitest reads `vite.config.ts` **by default** — the trap is the day someone adds
  a `vitest.config.ts` next to it
- In `mount()`, an auto-registered component resolves normally: the import was
  written into the SFC before the test ever ran

---

# The honest trade-off

**What you gain**

- No `routes` array to maintain, and renaming a page is a **typed** refactor
- Less noise at the top of every file; a UI library that ships only what you use

**What you pay**

- **Implicitness**: `useDebouncedSearch` comes from nowhere. Ctrl-click still works
  (that is what the `.d.ts` is for), plain reading does not
- **Three more build-time dependencies**, one of which is pre-1.0
- Onboarding: "where is this defined?" becomes a real question for newcomers
- Tooling drift: ESLint, Vitest, CI and your IDE each need to be told

> A reasonable middle ground: adopt **`unplugin-vue-router`** (the win is typed
> routes, not just fewer lines), keep imports explicit.

---

# Quiz — Question 1 / 3

**In `vite.config.ts`, you put `Vue()` before `VueRouter()`. What happens?**

- **A.** Nothing, Vite sorts plugins by `enforce`
- **B.** The SFC is compiled before `VueRouter` can extract `definePage()` and the
  `<route>` block, so route meta silently disappears
- **C.** The dev server refuses to start
- **D.** Routes are generated but `typed-router.d.ts` stays empty

<v-click>

> ✅ **B** — `VueRouter()` is a source transform on `.vue` files; it needs the SFC
> **before** `@vitejs/plugin-vue` turns it into render code. The failure is quiet,
> which is exactly why the README shouts about it.

</v-click>

---

# Quiz — Question 2 / 3

**CI fails on `vue-tsc --noEmit` with `Cannot find module 'vue-router/auto-routes'`,
but everything is green on your machine. Why?**

- **A.** A `node_modules` cache to clear
- **B.** `moduleResolution` is not set to `Bundler`
- **C.** The generated `.d.ts` files are gitignored and no build ran before the
  typecheck step
- **D.** `unplugin-vue-router` does not support CI

<v-click>

> ✅ **C** — The virtual module and its types only exist once the plugin has run.
> Either commit `typed-router.d.ts` / `auto-imports.d.ts` / `components.d.ts`, or
> make the pipeline build first. **B** is a real second cause — check it if
> committing the files does not fix it.

</v-click>

---

# Quiz — Question 3 / 3

**A test that mounts a page fails with `ref is not defined`. What did you forget?**

- **A.** `globals: true` in the Vitest config
- **B.** To import `ref` in the test file
- **C.** The plugins: a standalone `vitest.config.ts` does not inherit
  `vite.config.ts` — merge them
- **D.** `@vue/test-utils` does not support auto-imports

<v-click>

> ✅ **C** — Auto-imports are a **build-time** transform. No transform, no import,
> and the identifier is genuinely undefined at runtime. `mergeConfig(viteConfig, …)`
> is the fix; Vitest reading `vite.config.ts` directly is what hides the problem
> until someone splits the files.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 8 - File-based, typed routing — 45 min
