---
layout: cover
---

# 4 - Anatomy of a Vue plugin

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what `app.use()` actually does — and why it runs at most once per
  plugin object
- **Write** a plugin in both shapes (object and function) and **type** its options
- **Apply** the `createXxx` factory pattern, so the plugin's state belongs to the
  app and not to the module
- **Choose** between `provide` / `inject` and `app.config.globalProperties`
- **Expose** the plugin's API through a `useXxx` composable that **fails loudly**
  when the plugin was never installed

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
// plugins/toast/index.ts — the plugin provides the API under a typed key
export const toastKey: InjectionKey<ToastApi> = Symbol('toast');

export function createToast(options: ToastOptions = {}): Plugin {
  // ... build `api` from the options
  return { install(app) { app.provide(toastKey, api); } };
}
```

```ts
// plugins/toast/useToast.ts — the composable components call
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

# Recap

- A plugin is any object with an `install(app, options)` — or the function itself
- `app.use()` deduplicates by **object identity**, per app, and returns the app
- Prefer a **factory** (`createXxx`) so the state is per-app, resolved once — and
  so two `createXxx()` calls really are two different plugins
- **Provide** the API with a typed `InjectionKey`, expose it via a `useXxx` that
  **throws** when the plugin is missing
- A global property is the exception, not the default: spend one only on something
  you genuinely type in templates all day

> The workshop for this chapter is `tp/04_plugins/`.

---

# Quiz — Question 1 / 3

**`app.use(createToast())` is called twice, in two different files. What happens?**

- **A.** Nothing — Vue deduplicates plugins, the second call is ignored
- **B.** A runtime error: a plugin can only be installed once
- **C.** The second call silently overwrites the first
- **D.** The plugin installs twice: `createToast()` returns a new object each time

<v-click>

> ✅ **D** — Deduplication is a `Set` keyed by the **plugin object**. A factory
> returns a fresh one on every call, so `app.use()` sees two different plugins and
> installs both. The dev warning only shows if you pass the *same* object twice.

</v-click>

---

# Quiz — Question 2 / 3

**Your plugin exposes an API used from `<script setup>` with TypeScript. What do
you reach for?**

- **A.** `app.config.globalProperties.$api`
- **B.** `app.provide(apiKey, api)` with a typed `InjectionKey`, plus a `useApi()`
- **C.** `app.mixin({ created() { this.$api = api } })`
- **D.** A module-scope export, imported directly

<v-click>

> ✅ **B** — `globalProperties` needs `getCurrentInstance()` in `<script setup>`
> and manual module augmentation to be typed. A typed `InjectionKey` gives full
> inference, one instance per app, and lets a subtree override it.

</v-click>

---

# Quiz — Question 3 / 3

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

