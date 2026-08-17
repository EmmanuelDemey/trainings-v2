# TP 5 — Advanced routing with Vue Router

> This TP is **autonomous**: it does not depend on any other TP. The views, the
> fake backend and the auth store are provided and working; your job is to write
> the routing layer around them.

## Goal

Chapter 5 — Turn a set of unprotected pages into a real application:

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

- **Node.js >= 22** — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

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
