# TP 4 — Anatomy of a Vue plugin

> This TP is **autonomous**: it does not depend on any other TP. You are handed a
> demo app and the *shape* of a toast plugin — the types, the host component, the
> two consumers, and the toast queue itself. Turning it into a plugin is yours to
> write.

## Goal

Chapter 4 — Write a plugin another team could adopt without reading its source:

- The **factory pattern** (`createXxx`), so the state belongs to the app and not
  to the module
- **Typed options**, resolved **once**, with defaults
- `app.provide` with a typed **`InjectionKey`**, exposed through a `useXxx()`
  that **fails loudly** when the plugin was never installed
- A **global component** and a **global property** — and the module augmentation
  each one costs you

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The **Vue Devtools** extension: the Components tab is where you check that
  `toastKey` really is provided at app level

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

`tests/toast.spec.ts` is given and **red**: ten specs that drive the plugin
the way a consumer does — through the demo app's buttons and through
`useToast()`, never through its internals. Keep `npm run test:watch` open.

**The app does not start until step 1 is done**: `ToastHost` calls `useToast()`,
which has nothing to return yet. That is deliberate — it is the failure mode
step 4 is about.

**Already done for you**: `src/plugins/toast/queue.ts`. `createToastQueue()`
holds the toasts, dismisses them by id, drops the oldest past `max`, and runs
each toast's own auto-dismiss timer. Read it once; the workshop is about where
that queue gets created, not about how it counts.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The `createToast()` factory, its options and its state | `src/plugins/toast/index.ts` | The app starts again — `ToastHost` gets something back from `useToast()` |
| 2 | Register the host component globally | `index.ts` + `augmentations.d.ts` + `App.vue` | `App.vue` no longer imports `ToastHost` and `vue-tsc` is still green |
| 3 | Expose `$toast` as a global property | `index.ts` + `augmentations.d.ts` + `SettingsPanel.vue` | `$toast` works from a template, and `$toast(42)` is a compile error |
| 4 | Make a missing install fail loudly | `src/plugins/toast/useToast.ts` | The thrown message names the line the consumer forgot |

`npm test` grades all four through the demo app's buttons. Step 5 is a bonus and
is not graded.

## Steps

### 1. The factory and its options — `src/plugins/toast/index.ts`

1. Destructure `options` with the defaults `position = 'top-right'`,
   `duration = 4000`, `max = 3`. Do it **at the top of the factory**: resolved
   once, at creation, not on every `notify()`.
2. Create the state **in the closure**: `createToastQueue(duration, max)`.
3. Build the `ToastApi`: `toasts` (a `computed` read-only view of the queue's
   list), `position`, and the queue's `notify`, `dismiss`, `clear`.
4. Return `{ install(app) { app.provide(toastKey, api); } }`.

> Why a factory rather than `export const toast: Plugin`? Because a module-level
> queue is shared by every app in the process — and, in a test run, by every test.

→ **Done when** the app starts again, and `createToast()` returns a **new**
plugin object, with its own state, on every call.

### 2. The global component — `index.ts` + `augmentations.d.ts` + `App.vue`

Register `ToastHost` inside `install()`, so a consumer never imports it. Then
declare it in `augmentations.d.ts` (`GlobalComponents`) and **delete its local
import from `App.vue`** — `app.component()` tells Vue, only the augmentation
tells `vue-tsc`.

→ **Done when** `App.vue` has no local import of `ToastHost` left, the host
still renders, and `npm run typecheck` exits 0.

### 3. The global property — `index.ts` + `augmentations.d.ts` + `SettingsPanel.vue`

1. Expose `notify` as `$toast` in `install()`.
2. Declare it in `augmentations.d.ts` (`ComponentCustomProperties`).
3. Add the button of TODO 3 to `SettingsPanel.vue`, calling `$toast` straight
   from the template.

> This is the **exception**. Be ready to say why: no override per subtree, never
> tree-shaken, and it needs the augmentation above to be anything but `any`.

→ **Done when** the new button calls `$toast` straight from the template, and
`$toast(42)` is a compile error rather than a runtime surprise.

### 4. Fail loudly — `src/plugins/toast/useToast.ts`

Throw when `inject` comes back empty, with `app.use(createToast())` written in
the message. Then check it: comment out the `.use(...)` in `main.ts`, reload, and
read the console. Put it back.

→ **Done when** you have seen that error in the console yourself, and the
`.use(...)` is back in `main.ts`.

### 5. *(Bonus)* Prove the per-app isolation yourself

In `main.ts`, mount a second app on another element with its own
`createToast({ position: 'bottom-center' })`. Notify from one, and check the
other stays empty — then find both apps in the Devtools app selector.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the ten specs
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No Vue warning in the browser console

**The behaviour is there**

- [ ] `createToast()` returns a **new** plugin object each call, with its own state
- [ ] Defaults are resolved once, at creation — `position` is readable on the API
- [ ] `toasts` is a read-only view: a consumer cannot push into it
- [ ] `duration` and `max` reach the queue — `main.ts` asks for two toasts, six seconds each
- [ ] `ToastHost` is registered globally and **no longer imported** by `App.vue`
- [ ] `$toast` works from a template and is typed — `$toast(42)` is a compile error
- [ ] `useToast()` without the plugin throws, and the message names the missing line

**You can explain**

- [ ] What `app.use()` does with the same plugin object twice, and why a factory
      escapes that deduplication
- [ ] Why `provide` / `inject` is the default and `globalProperties` the exception
- [ ] What `augmentations.d.ts` buys you that `install()` cannot
- [ ] Why the plugin's state must not live at module scope

## Going further

- Add `pauseOnHover`: hovering a toast suspends its timer, leaving resumes it.
  Where does that state belong — the plugin, or `ToastHost`?
- Let a subtree override the API with a component-level `provide(toastKey, ...)`
  that records the calls instead of showing them. That is the test double a
  `globalProperties` design cannot offer.
- Make the plugin installable twice on purpose, keyed by name
  (`createToast({ name: 'errors' })`), and see what has to change in `useToast()`.
- Read the `install()` of `createPinia()` in `node_modules/pinia`. How much of
  what you just wrote is in there?
