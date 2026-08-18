---
layout: cover
---

# 3bis - Anatomy of a Vue plugin

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what `app.use()` actually does — and why it runs at most once per
  plugin object
- **Write** a plugin in both shapes (object and function) and **type** its options
- **Choose** between `provide` / `inject` and `app.config.globalProperties`, and
  **augment** the Vue types for either one
- **Own** the effects and the state of a plugin with `effectScope` and
  `app.onUnmount`
- **Read** the `install()` of Vue Router and Pinia and recognise the same anatomy
- **Test** a plugin, and **package** it as a publishable library

---

# What is a plugin?

> A **plugin** is a piece of code that installs **app-level** features on a Vue
> application instance.

- The unit of reuse is no longer a component or a function, but the **application**
- It is the only official way to touch what belongs to the app:
  global components, global directives, app-level `provide`, global properties,
  `app.config`
- Every big library in the ecosystem is one: **Vue Router**, **Pinia**, **vue-i18n**,
  Sentry, Apollo, PrimeVue…

<br />

| Reach for a… | when the logic is |
|---|---|
| Composable | called explicitly, per component |
| Directive | attached to an element |
| **Plugin** | **wired once, available to the whole app** |

---

# The contract: `app.use()`

```ts
// Simplified from @vue/runtime-core — this is the whole mechanism
use(plugin, ...options) {
  if (installedPlugins.has(plugin)) {
    warn(`Plugin has already been applied to target app.`);   // dev only
  } else if (isFunction(plugin.install)) {
    installedPlugins.add(plugin);
    plugin.install(app, ...options);
  } else if (isFunction(plugin)) {
    installedPlugins.add(plugin);
    plugin(app, ...options);
  } else {
    warn(`A plugin must either be a function or an object with an "install" function.`);
  }
  return app;                                                 // hence chaining
}
```

- Deduplication is by **object identity**, in a `Set`, **per app**
- `install` is called **synchronously**, and its return value is ignored

---

# Two shapes, one contract

```ts
import type { App, Plugin } from 'vue';

// 1. Object plugin — the common one
export const analytics: Plugin = {
  install(app: App, options: AnalyticsOptions): void { /* ... */ },
};

// 2. Function plugin — the function *is* the install
export const analyticsFn: Plugin = (app: App, options: AnalyticsOptions) => {
  /* ... */
};
```

```ts
// The types Vue exports
type PluginInstallFunction<Options> = (app: App, options: Options) => any;
type ObjectPlugin<Options>   = { install: PluginInstallFunction<Options> };
type FunctionPlugin<Options> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>;
```

> If an object has an `install` **and** is callable, `install` wins.

---

# What `install()` can reach

```ts
install(app: App): void {
  app.component('ToastHost', ToastHost);        // global component
  app.directive('tooltip', vTooltip);           // global directive
  app.provide(toastKey, api);                   // app-level injection
  app.config.globalProperties.$toast = notify;  // template shortcut
  app.config.errorHandler = reportToSentry;     // error interception
  app.onUnmount(() => scope.stop());            // cleanup (Vue 3.5)
  app.use(otherPlugin);                         // compose plugins
  app.mixin({ /* ... */ });                     // ⚠️ Vue 2 legacy — avoid
}
```

- `app` is fully usable **before `mount()`** — that is the whole point of the hook
- `app.config.errorHandler` is a **single slot**: the last plugin wins. Chain it
  yourself if you install two

---

# Typed options, and the factory pattern

```ts
export interface ToastOptions {
  position?: 'top-right' | 'bottom-center';
  duration?: number;
  max?: number;
}

// A factory returns a *new* plugin object, holding *its own* state
export function createToast(options: ToastOptions = {}): Plugin {
  const { position = 'top-right', duration = 4000, max = 3 } = options;
  // ... state lives here, one instance per call
  return { install(app) { /* ... */ } };
}
```

```ts
app.use(createToast({ duration: 6000 }));
```

- `createRouter`, `createPinia`, `createI18n` — the ecosystem converged on this
- Defaults are resolved **once**, at creation, not on every use
- Consequence: two `createToast()` calls are **two different objects**, so the
  deduplication in `app.use()` does **not** catch them

---

# `provide` / `inject` vs `globalProperties`

```ts
// 1. app.provide + a typed InjectionKey — the modern default
export const toastKey: InjectionKey<ToastApi> = Symbol('toast');
app.provide(toastKey, api);

export function useToast(): ToastApi {
  const api = inject(toastKey);
  if (!api) throw new Error('[toast] missing plugin — did you app.use(createToast())?');
  return api;
}
```

|  | `provide` / `inject` | `globalProperties` |
|---|---|---|
| `<script setup>` | `inject(key)` | needs `getCurrentInstance()` |
| Template | via the composable's return | `$toast(...)` directly |
| Typing | inferred from `InjectionKey<T>` | manual module augmentation |
| Overridable per subtree | yes | no |
| Tree-shaking | the key is an import | never removed |

> Provide the API, and expose it through a `useXxx` composable. Add a global
> property only for something you genuinely type in templates all day.

---

# Failing loudly beats failing silently

```ts
const api = inject(toastKey);              // ToastApi | undefined
```

- `inject` without a default returns `undefined` and logs a **dev-only** warning
- In production, you get `Cannot read properties of undefined` three call frames
  away from the real mistake

```ts
export function useToast(): ToastApi {
  const api = inject(toastKey);
  if (!api) {
    throw new Error(
      '[toast] plugin not installed. Add `app.use(createToast())` in main.ts.',
    );
  }
  return api;
}
```

> One throw, with the fix written in the message. This is the single highest-value
> line in a plugin you ship to other teams.

---

# Typing `globalProperties`

```ts
// plugins/toast/types.ts
import type { ToastApi } from './api';

declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: ToastApi['notify'];
  }
}

export {};      // required: makes the file a module, so `declare module` augments
```

- Since Vue 3.3 you augment **`'vue'`**; older code augments `'@vue/runtime-core'`
- Ship this file in your package's types so consumers get it for free
- Related augmentation points: `ComponentCustomProps` (extra props on every
  component), `ComponentCustomOptions` (extra component options — this is how
  Vue Router types `beforeRouteEnter`)

---

# Owning state and effects

```ts
import { effectScope, ref, onScopeDispose, type Plugin } from 'vue';

export function createToast(options: ToastOptions = {}): Plugin {
  const scope = effectScope(true);                  // detached: no parent component

  const api = scope.run(() => {
    const toasts = ref<Toast[]>([]);
    const timers = new Set<ReturnType<typeof setTimeout>>();

    watch(toasts, () => { /* ... */ });             // owned by the scope

    onScopeDispose(() => timers.forEach(clearTimeout));
    return { toasts, notify, dismiss };
  })!;

  return {
    install(app) {
      app.provide(toastKey, api);
      app.onUnmount(() => scope.stop());            // Vue 3.5
    },
  };
}
```

---

# Cleanup: `app.onUnmount` (3.5) vs the old way

```ts
// Vue 3.5 and later
app.onUnmount(() => scope.stop());
```

```ts
// What every library did before 3.5 — still visible in Vue Router's source
const unmountApp = app.unmount;
app.unmount = function () {
  cleanup();
  unmountApp();
};
```

- Timers, `IntersectionObserver`s, WebSockets, `window` listeners: an app that is
  unmounted and re-mounted (micro-frontends, tests, Storybook) leaks all of them
- `effectScope.stop()` disposes **reactive effects only** — clear your own
  timers and listeners in `onScopeDispose`
- On the **server** the app is rendered, never mounted: `onUnmount` never fires

---

# `runWithContext` — injecting outside a component

```ts
install(app) {
  // inject() normally requires an active component instance
  const router = app.runWithContext(() => inject(routerKey));

  api.onDismissAll(() => router?.push('/'));
}
```

- `app.runWithContext(fn)` makes the app the **active instance** for the duration
  of `fn`, so `inject()` resolves against `app.provide()`
- Available since Vue 3.3 — before that, plugins reached into `app._context.provides`
- It is also the cleanest way to **unit-test** what a plugin provided

---

# Case study — a toast plugin

The goal: `useToast().notify('Saved')` from anywhere, a stack rendered at the app
root, and nothing left running when the app goes away.

<br />

Requirements:

1. Options: `position`, `duration`, `max` — with sane defaults
2. **One instance per app**, so two apps (or two tests) never share a stack
3. A **global component** to render the stack, mounted through `Teleport`
4. A typed `useToast()` composable, and a `$toast` shortcut for templates
5. Auto-dismiss after `duration`, capped at `max` visible toasts
6. Every timer cleared when the app unmounts

---

# Case study — the API

```ts
// plugins/toast/api.ts
export interface Toast { id: number; message: string; type: 'info' | 'error' }

export function createToastApi({ duration, max }: Required<ToastOptions>) {
  const toasts = ref<Toast[]>([]);
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  let nextId = 0;

  function dismiss(id: number): void {
    clearTimeout(timers.get(id));
    timers.delete(id);
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function notify(message: string, type: Toast['type'] = 'info'): number {
    const id = nextId++;
    toasts.value = [...toasts.value.slice(-(max - 1)), { id, message, type }];
    if (duration > 0) timers.set(id, setTimeout(() => dismiss(id), duration));
    return id;
  }

  onScopeDispose(() => timers.forEach(clearTimeout));
  return { toasts: readonly(toasts), notify, dismiss };
}
```

---

# Case study — the plugin

```ts
// plugins/toast/index.ts
import { effectScope, type App, type Plugin } from 'vue';
import ToastHost from './ToastHost.vue';

export function createToast(options: ToastOptions = {}): Plugin {
  const resolved = { position: 'top-right', duration: 4000, max: 3, ...options };
  const scope = effectScope(true);
  const api = scope.run(() => createToastApi(resolved))!;

  return {
    install(app: App): void {
      app.provide(toastKey, api);
      app.provide(toastOptionsKey, resolved);
      app.component('ToastHost', ToastHost);
      app.config.globalProperties.$toast = api.notify;
      app.onUnmount(() => scope.stop());
    },
  };
}

export { useToast, toastKey };
export type { ToastOptions, Toast, ToastApi };
```

---

# Case study — consuming it

```ts
// main.ts
createApp(App)
  .use(createToast({ duration: 6000, max: 5 }))
  .mount('#app');
```

```vue
<!-- Anywhere -->
<script setup lang="ts">
import { useToast } from '@/plugins/toast';

const { notify } = useToast();

async function save(): Promise<void> {
  try { await api.save(form); notify('Saved'); }
  catch { notify('Could not save', 'error'); }
}
</script>

<template>
  <ToastHost />          <!-- once, at the app root -->
  <button @click="save">Save</button>
</template>
```

---

# Global components — the cost

```ts
app.component('ToastHost', ToastHost);
```

- Registered globally means **always in the bundle**, whether it is used or not —
  no tree-shaking, ever
- Register **one or two** entry points (`RouterView`, `ToastHost`), not a design system
- Prefix component names to avoid collisions: `PvButton`, `ElInput`
- For a whole library, let consumers opt in:

```ts
// Explicit imports, tree-shaken
import { Button, Dialog } from '@acme/ui';

// or an unplugin resolver that imports on demand
import Components from 'unplugin-vue-components/vite';
```

---

# Anatomy of Vue Router's `install`

```ts
install(app) {
  app.component('RouterLink', RouterLink);        // 1. global components
  app.component('RouterView', RouterView);

  app.config.globalProperties.$router = router;   // 2. Options API access
  Object.defineProperty(app.config.globalProperties, '$route', {
    enumerable: true, get: () => unref(currentRoute),
  });

  if (isBrowser && !started) { started = true; push(routerHistory.location); }

  app.provide(routerKey, router);                 // 3. what useRouter() reads
  app.provide(routeLocationKey, shallowReactive(reactiveRoute));

  const unmountApp = app.unmount;                 // 4. cleanup, pre-3.5 style
  app.unmount = function () { /* reset state */ unmountApp(); };
}
```

- The initial navigation is triggered **on install** — hence `await router.isReady()`
- `$route` is a **getter**, so it never goes stale

---

# Anatomy of Pinia's `install`

```ts
install(app) {
  setActivePinia(pinia);                          // useStore() outside setup
  pinia._a = app;                                 // keep the app around
  app.provide(piniaSymbol, pinia);                // what useStore() injects
  app.config.globalProperties.$pinia = pinia;
  if (__DEV__ && IS_CLIENT) registerPiniaDevtools(app, pinia);
  toBeInstalled.forEach((plugin) => _p.push(plugin));   // pinia.use() before app.use()
  toBeInstalled = [];
}
```

- `createPinia()` opens its own `effectScope(true)`; every store runs inside it,
  so `pinia._e.stop()` disposes the whole state tree at once
- The same three moves as the router: **provide**, **global property**, **devtools**
- ⚠️ Don't confuse the two plugin systems: a **Pinia plugin** (`pinia.use`, chapter 6)
  extends *stores*; a **Vue plugin** (`app.use`) extends the *app*

---

# Install order

```ts
const app = createApp(App);

app.use(createPinia());     // 1. stores may be used by router guards
app.use(router);            // 2. guards may use stores
app.use(createToast());
app.mount('#app');          // last
```

- `app.use()` after `mount()` is too late for anything the initial render resolves
- If plugin B `inject`s what plugin A provided, **B must be installed after A** —
  and should say so in its error message
- A plugin can install its own dependencies: `app.use(dependency)` inside `install`
  is idempotent, thanks to the per-app `Set`

---

# Plugins and SSR

```ts
// ❌ Module scope: one instance for the whole Node process
const currentUser = ref<User | null>(null);

// ✅ Factory: one instance per createApp(), i.e. per request
export function createAuth(): Plugin {
  const currentUser = ref<User | null>(null);
  return { install(app) { app.provide(authKey, { currentUser }); } };
}
```

- On the server, **one app per request** — module-scope state leaks one user's
  session into another's HTML
- `install()` runs on the server too: guard `window`, `document`, `localStorage`
- Register browser-only side effects behind `if (typeof window !== 'undefined')`,
  or move them into `onMounted`

---

# Testing a plugin

```ts
// 1. Through a component, with test-utils
const wrapper = mount(SaveButton, {
  global: { plugins: [createToast({ duration: 0 })] },   // no timers in tests
});
await wrapper.get('button').trigger('click');
expect(wrapper.text()).toContain('Saved');
```

```ts
// 2. The install itself, with no component at all
it('provides a toast api capped at `max`', () => {
  const app = createApp({ render: () => null });
  app.use(createToast({ max: 1, duration: 0 }));

  const api = app.runWithContext(() => inject(toastKey))!;
  api.notify('first');
  api.notify('second');

  expect(api.toasts.value).toHaveLength(1);
});
```

> A plugin built by a factory is trivially testable: no global state to reset
> between two `it()`.

---

# Shipping it as a package

```json
{
  "name": "@acme/vue-toast",
  "type": "module",
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./style.css": "./dist/style.css"
  },
  "peerDependencies": { "vue": "^3.5.0" }
}
```

```ts
// vite.config.ts — library mode
build: {
  lib: { entry: 'src/index.ts', formats: ['es'] },
  rollupOptions: { external: ['vue'] },      // never bundle Vue: two copies = two apps
}
```

- `vue` in **`peerDependencies`**, never in `dependencies`
- Emit types (`vue-tsc --declaration --emitDeclarationOnly` or `vite-plugin-dts`) and
  include the `declare module 'vue'` augmentation in the entry point

---

# Devtools integration — the finishing touch

```ts
import { setupDevtoolsPlugin } from '@vue/devtools-api';

if (import.meta.env.DEV) {
  setupDevtoolsPlugin({ id: 'acme.toast', label: 'Toasts', app }, (api) => {
    api.addTimelineLayer({ id: 'toast', label: 'Toasts', color: 0xff9800 });
    api.addInspector({ id: 'toast', label: 'Toasts' });
  });
}
```

- This is how the **Router**, **Pinia** and **Vue Query** tabs appear in the panel
  (chapter 0bis)
- Always behind a `DEV` guard: the API is stripped from production builds
- Optional, but it is what turns an internal plugin into one people enjoy debugging

---

# When *not* to write a plugin

- The logic is **called explicitly** by a component → a composable, imported
- It applies to **one element** → a directive
- You only want to avoid an import → that is what your editor is for

<br />

And once you do write one:

- ❌ `app.mixin()` — Vue 2 legacy, runs on **every** component instance
- ❌ Ten entries in `globalProperties` — untyped, uncollectable, uncollidable-with
- ❌ Side effects at **import** time — they run in SSR, in tests, and survive
  tree-shaking. Everything goes in `install()`
- ❌ A module-level singleton — it works until the second app, the first test, or
  the first server render

---

# Recap

- A plugin is any object with an `install(app, options)` — or the function itself
- `app.use()` deduplicates by **object identity**, per app, and returns the app
- Prefer a **factory** (`createXxx`) so state is per-app: SSR-safe and testable
- **Provide** the API with a typed `InjectionKey`, expose it via a `useXxx` that
  **throws** when the plugin is missing
- Own your effects in an `effectScope`, stop it from `app.onUnmount` (Vue 3.5)
- Global components and global properties are permanent bundle weight — spend them
  deliberately
- Vue Router and Pinia do exactly this, in twenty lines of `install`

---

# Quiz — Question 1 / 5

**`app.use(createToast())` is called twice, in two different files. What happens?**

- **A.** Nothing — Vue deduplicates plugins, the second call is ignored
- **B.** The plugin installs twice: `createToast()` returns a new object each time
- **C.** A runtime error: a plugin can only be installed once
- **D.** The second call silently overwrites the first

<v-click>

> ✅ **B** — Deduplication is a `Set` keyed by the **plugin object**. A factory
> returns a fresh one on every call, so `app.use()` sees two different plugins and
> installs both. The dev warning only shows if you pass the *same* object twice.

</v-click>

---

# Quiz — Question 2 / 5

**Your plugin exposes an API used from `<script setup>` with TypeScript. What do
you reach for?**

- **A.** `app.config.globalProperties.$api`
- **B.** `app.mixin({ created() { this.$api = api } })`
- **C.** `app.provide(apiKey, api)` with a typed `InjectionKey`, plus a `useApi()`
- **D.** A module-scope export, imported directly

<v-click>

> ✅ **C** — `globalProperties` needs `getCurrentInstance()` in `<script setup>`
> and manual module augmentation to be typed. A typed `InjectionKey` gives full
> inference, one instance per app, and lets a subtree override it.

</v-click>

---

# Quiz — Question 3 / 5

**A plugin keeps its state in a `ref` declared at module scope. The app is
server-rendered. What is the risk?**

- **A.** None — the module is re-evaluated for every request
- **B.** The state is not reactive on the server
- **C.** Hydration mismatches only
- **D.** The state is shared by every request served by the Node process — one
  user's data can end up in another user's HTML

<v-click>

> ✅ **D** — Modules are evaluated **once per process**, while `createApp()` runs
> **once per request**. Put the state inside the factory, and it follows the app.

</v-click>

---

# Quiz — Question 4 / 5

**Where do the watchers and timers created by your plugin go when the app is
unmounted?**

- **A.** Vue disposes them automatically with the root component
- **B.** Nowhere: create them in an `effectScope`, `stop()` it from `app.onUnmount`,
  and clear timers in `onScopeDispose`
- **C.** They stop as soon as no component injects the plugin anymore
- **D.** `app.unmount()` calls `install()` in reverse

<v-click>

> ✅ **B** — Effects created outside a component belong to nobody. `effectScope`
> gives them an owner, `app.onUnmount` (Vue 3.5) gives you the moment to release
> it. Before 3.5, libraries monkey-patched `app.unmount` — read Vue Router's
> source for the pattern.

</v-click>

---

# Quiz — Question 5 / 5

**`useToast()` is called in a component of an app where the plugin was never
installed. What should happen?**

- **A.** `inject` returns `undefined`, and the component crashes later on a
  property access
- **B.** The composable falls back to a `console.log` implementation
- **C.** The composable throws immediately, with the missing `app.use(...)` call
  in the message
- **D.** Vue throws by itself — an app-level `provide` is mandatory

<v-click>

> ✅ **C** — `inject` without a default returns `undefined` and only warns in
> development. Failing fast, at the exact call site, with the fix written in the
> message, is what separates a plugin people can adopt from one they file bugs
> against.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 3bis - From directives to a real plugin — 30 min

Continue in `tp/03_composables_directives`, on top of step 5:

1. Turn `directivesPlugin` into a **factory** `createDirectivesPlugin(options)`
   taking `{ rootMargin, fallbackSrc }`, with defaults resolved once
2. `provide` the resolved options under a typed `InjectionKey`, and read them from
   a `useLazyImgConfig()` that **throws** when the plugin is missing
3. Register `lazyStats` as an app-level injection instead of a module export —
   then explain what that fixes
4. Add `app.onUnmount()` and verify, in the Devtools, that nothing survives an
   `app.unmount()`
5. *(Bonus)* Add `$notify` to `globalProperties` and type it with
   `declare module 'vue'` — `vue-tsc` must stay green

**Done when** you can install the plugin twice, on two apps, and each one keeps
its own configuration and its own stats.

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
