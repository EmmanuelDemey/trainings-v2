# TP 6 — Advanced routing with Vue Router

> This TP is **autonomous**: it does not depend on any other TP. The views, the
> fake backend and the auth store are provided and working; your job is to write
> the routing layer around them.

## Goal

Chapter 6 — Turn a set of unprotected pages into a real application:

- **Typed `meta`** so the router refactors safely
- **Route transitions**, including a direction-aware one
- **Guards**: authentication, roles, and blocking navigation away from a dirty form
- **Programmatic navigation**: redirects, `NavigationFailure`, history
- **Scroll behaviour** that restores position on back/forward

## Accounts

| Email | Password | Roles |
|---|---|---|
| `ada@example.com` | `admin` | `admin`, `user` |
| `alan@example.com` | `user` | `user` |

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

Steps 3 to 6 come with their specs already written: **`tests/router.spec.ts`** is
the guard contract of this README, written down — the `?redirect` round trip and
its two open-redirect traps, the role check, the cold start, `document.title`, and
`scrollBehavior` called as the pure function it is. It is red on the skeleton;
keep `npm run test:watch` in a second terminal and make it go green.

What it deliberately leaves alone needs a real browser: the transitions, the
actual scroll *position*, and the dirty-form `confirm`. Those stay below as checks
you run by hand.

## Steps

### 1. Type the `meta` fields — `src/router/types.d.ts`

Add `requiresAuth`, `roles` and `transition` to the `RouteMeta` interface. Every
guard you write next depends on this being right.

### 2. Route transitions — `src/App.vue`

1. Switch `<RouterView>` to its `v-slot` form and wrap the component in a
   `<Transition name="fade" mode="out-in">`.
2. Drive the transition name from `route.meta.transition`, defaulting to `fade`.
3. *(Bonus)* Add `<KeepAlive :include="['InvoicesView']">` and check that the
   filter and the scroll position survive a round trip.

### 3. Authentication — `src/router/index.ts` + `src/views/LoginView.vue`

1. Flag `/invoices` and `/invoices/:id` with `meta.requiresAuth`.
2. Write the global `beforeEach`: restore the session, redirect anonymous users
   to `/login?redirect=…`, and bounce an authenticated user away from `/login`.
3. In `LoginView`, honour the `redirect` query with `router.replace`.
4. **Validate** the redirect target: only accept a path starting with a single
   `/`. Try `?redirect=https://example.com` without the check to see why.

**Check it**: open `/invoices` signed out — you land on login and come back to
`/invoices` after signing in. Then sign in and **hard-refresh** `/invoices`: you
must stay there (that is what `restoreSession` buys you).

### 4. Roles — `src/router/index.ts`

1. Add `meta: { requiresAuth: true, roles: ['admin'] }` to `/admin`.
2. Extend the guard to redirect to `{ name: 'forbidden' }` when the role check
   fails. Verify with both accounts.

### 5. Navigation and history

1. Implement `scrollBehavior`: restore `savedPosition`, honour `to.hash`, and
   otherwise scroll to the top. Test on the long `/invoices` page.
2. In `InvoiceView`, handle the `NavigationFailure` returned by `router.push`
   (click "Next invoice" twice on the last id).

### 6. The remaining guards

1. `afterEach`: set `document.title` from `to.meta.title`.
2. *(Bonus)* Direction-aware transitions: compare path depths in `afterEach` and
   set `to.meta.transition` to `slide-left` / `slide-right`.
3. In `InvoiceFormView`, block navigation away from a dirty form with
   `onBeforeRouteLeave` — and do **not** block right after a successful submit.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the guard, the redirect validation, `document.title` and
      `scrollBehavior`
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src | grep -v bonus` returns nothing
- [ ] No Vue Router warning in the browser console during a full navigation tour

**The behaviour is there**

- [ ] `RouteMeta` is typed: a typo in `meta.rols` or `roles: 'admin'` is a **compile
      error**, not a silent no-op
- [ ] Signed out, `/invoices` sends you to `/login?redirect=/invoices` and lands you
      back on `/invoices` after signing in
- [ ] Signed in, a **hard refresh** on `/invoices` keeps you there
- [ ] `?redirect=https://example.com` and `?redirect=//example.com` are both refused
- [ ] A signed-in user opening `/login` is bounced away
- [ ] `alan@example.com` on `/admin` lands on `/forbidden`; `ada@example.com` gets in
- [ ] The transition name comes from `route.meta.transition`, falling back to `fade`
- [ ] Back from an invoice restores the scroll position on the long `/invoices` page; a
      brand-new route starts at the top; a link with a `#hash` scrolls to the anchor
- [ ] "Next invoice" on the last id does **not** throw: the `NavigationFailure` is
      handled and something is shown to the user
- [ ] `document.title` changes on every navigation
- [ ] Editing the form then navigating away asks for confirmation — and a **successful
      submit** navigates without asking

**You can explain**

- [ ] What an unvalidated `?redirect=` gives an attacker
- [ ] Why the login navigation uses `replace` and not `push`
- [ ] Why `restoreSession` has to run inside the guard, before the auth check
- [ ] What `<KeepAlive>` changes for the guards of a cached component

## Going further

- Replace the `confirm()` in the leave guard with a real modal. Why is that
  harder than it looks, and what does the guard's return value have to become?
- Add a `router.onError` handler and simulate a failing lazy route.
- Feature-detect `document.startViewTransition` and use it instead of
  `<Transition>` when available.

## Later in the training

3 later chapters come back to this same project. Their sessions are **not run in
the room**: the 3-day schedule keeps one practical slot per taught chapter, so
these three are yours to do **on your own, after the session**. Each has its own
*Done when*, and each builds on the state the previous left behind — follow the
training order.

### Chapter 8 — File-based, typed routing (45 min)

Continue in this project, on top of the finished auth flow:

1. Install `unplugin-vue-router`, move `src/views/` to `src/pages/` and delete the
   `routes` array — the app must still work, guards included
2. Rebuild the URLs with the conventions: `[id]`, a `(group)`, a `users.vue`
   layout and a `[...path].vue` 404
3. Move `meta.requiresAuth` / `meta.roles` into `definePage()`, and make
   `useRoute('/invoices/[id]')` give you a typed `params.id`
4. Add `unplugin-auto-import` (`vue`, `pinia`, `VueRouterAutoImports`, plus
   `src/composables/**`) and strip the now-dead imports from three components
5. Add `unplugin-vue-components` and check in `dist/` that a component you stopped
   using is **no longer in the bundle**
6. *(Bonus)* Make `npm run test` pass again by merging the Vite config into Vitest

**Done when** `npm run typecheck` is green **on a fresh clone** — decide, and be
able to justify, whether the three `.d.ts` files are committed.

### Chapter 13 — Error handling & observability (45 min)

Continue in this project, on the invoices application:

1. Make `InvoiceView` throw on one specific invoice, and watch the current
   behaviour: what does the user see, and what is left in the DOM?
2. Write `<ErrorBoundary>` with a **fallback scoped slot** exposing `error` and
   `reset`, and wrap the widget. Check the rest of the page still works
3. Make "Retry" actually retry — prove that a `reset()` alone loops, then fix it
   with a `key`
4. Wrap `<RouterView>` in a second boundary with a `resetKey`, and verify that
   navigating away clears the error screen
5. Wire `app.config.errorHandler` to a `reporter` module logging `{ err, info }`,
   and check the boundary's error **does not** appear there — then make the
   boundary report it itself
6. Add the `window.onerror` and `unhandledrejection` listeners, then trigger each
   one from the console
7. Add `router.onError`, and make a guard throw. Confirm that a guard returning
   `false` does **not** reach it
8. *(Bonus)* Swap `reporter` for `@sentry/vue` pointed at a free-tier or
   GlitchTip DSN, build with `sourcemap: 'hidden'`, and read one real stack trace

**Done when** no failure can produce a blank page, and every one of them shows up
in the reporter — exactly once.

### Chapter 15 — Internationalizing the invoices app (45 min)

Continue in this project, on the invoices application:

1. Install `vue-i18n`, create the plugin with `legacy: false`, and extract the
   hard-coded French strings of `InvoicesView` into `src/locales/fr.json` with
   namespaced keys
2. Add `en.json`, type the catalogue with `MessageSchema` + `declare module`, and
   check that removing a key from `en.json` **fails `npm run typecheck`**
3. Format the invoice amounts with `n()` and the dates with `d()`. Add a `compact`
   number format and use it in the list
4. Write the empty-state message with **three plural forms** and verify it for
   `0`, `1` and `12` in both locales — the French zero is the interesting one
5. Add a `ru` catalogue for that one key with its **four CLDR forms**, register
   `cldrRule('ru')` in `pluralRules`, and check `1`, `2`, `5` and `21`. Remove the
   rule and show which of the four the default gets wrong
6. Replace the "J'accepte les conditions" sentence with `<i18n-t>` and a real
   `<RouterLink>` inside it
7. Move the catalogues behind `import.meta.glob`, write `setLocale()` with the
   `pending` guard and the `<html lang>` update, and add `/:locale(fr|en)?` to the
   routes with a `beforeEach` that awaits it
8. Build, open the network tab, and confirm **one chunk per locale** — only the
   active one is downloaded
9. Add `@intlify/unplugin-vue-i18n` with `strictMessage` and `dropMessageCompiler`,
   rebuild, and **compare the two bundle sizes** (`npx vite-bundle-visualizer`)
10. *(Bonus)* Write two tests: one asserting the plural boundary at `0` in French,
    one mounting with a fresh `i18n` per test and switching locale

**Done when** switching the locale changes the URL, the `<html lang>`, the plurals
and the number formats — and the locale you are not using is not in the bundle.
