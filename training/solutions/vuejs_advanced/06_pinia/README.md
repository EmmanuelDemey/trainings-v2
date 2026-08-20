# TP 6 — Pinia

> This TP is **autonomous**: it does not depend on any other TP. The app works as
> shipped — it is just built the way real projects end up after a while. Your job
> is to fix it, measuring at every step.

## Goal

Chapter 6 — Take a working "god store" and turn it into something that scales:

- **Split** one store into three, by domain, and watch wasted re-renders disappear
- **`shallowRef`** for a large payload that is never mutated in place
- **Index with a `Map`** instead of an O(n) getter taking an argument
- **A persistence plugin** with an opt-in, typed store option
- **HMR** so editing a store no longer drops your state
- **An observability plugin** built on `$onAction` and `$subscribe`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The **Vue Devtools** browser extension (Pinia tab + Timeline)

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

Every panel displays its own **render counter** and the app displays the cost of
the catalog assignment. Write the numbers down before each change.

## Steps

### 1. Split the store — `src/stores/shop.ts`

1. Extract `useCatalogStore`, `useCartStore` and `useUiStore` into three files.
   `useCartStore` gets the catalog by calling `useCatalogStore()` inside its
   setup function.
2. Keep the app working as you go — update the components' imports.
3. Point `ThemePanel` at `useUiStore` and confirm its render counter stops moving
   when you reload the catalog.

**Baseline to beat**: load a 10 000-product catalog and note how many times
`ThemePanel` re-rendered.

### 2. `shallowRef` — the catalog

Switch `products` to `shallowRef` and reload a 30 000-product catalog. Compare
the "assignment" duration displayed in the panel.

Then answer: what would break if some code mutated `products.value[0].price`
directly, and how would you make it work anyway?

### 3. Index instead of a getter with an argument

1. Replace `productById` with a cached `byId` computed returning a `Map`.
2. Update `CartPanel` to use it.
3. With a 30 000-product catalog and a dozen cart lines, compare the "last
   update" timing before and after.

### 4. The persistence plugin — `src/plugins/persist.ts`

1. Bail out when `options.persist` is falsy.
2. Restore the state from `localStorage` on creation, guarding the JSON parse.
3. Persist on every mutation with `$subscribe`.
4. Support `persist: { paths: ['lines'] }` to persist only some keys.
5. Type the custom option in `src/plugins/pinia.d.ts` and remove every cast.

**Check it**: fill the cart, reload the page, and confirm it comes back — while
the catalog does **not** (it is not marked `persist`).

### 5. HMR

Add `acceptHMRUpdate` to every store. Fill the cart, edit a label in a store
file, and confirm the cart survives.

### 6. The logger plugin — `src/plugins/logger.ts`

1. Measure every action with `$onAction`, recording both success and failure.
   Trigger a failure with `failureSwitch.products = true`.
2. Log the mutation type with `$subscribe`, then convert `addToCart` to `$patch`
   and watch the type change.
3. *(Bonus)* Expose the log on every store as `$actionLog` and type it.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src | grep -v bonus` returns nothing
- [ ] No Pinia or Vue warning in the browser console

**The behaviour is there**

- [ ] Three stores in three files; `src/stores/shop.ts` is gone and nothing imports it
- [ ] `useCartStore` reads the catalog by calling `useCatalogStore()` inside its setup —
      no cross-import of state
- [ ] Reloading the catalog no longer moves `ThemePanel`'s render counter, and you have
      the before/after numbers written down
- [ ] `products` is a `shallowRef`, and you have the assignment duration for a
      30 000-product catalog before and after
- [ ] `productById` is replaced by a cached `byId` `Map` computed, `CartPanel` uses it,
      and you have the "last update" timing before and after
- [ ] Filling the cart and reloading brings the cart back — and the catalog **does not**
- [ ] `persist: { paths: ['lines'] }` persists only `lines`
- [ ] A corrupted `localStorage` entry does not break app startup
- [ ] `src/plugins/pinia.d.ts` declares `DefineStoreOptionsBase.persist`, so
      `options.persist` is typed inside the plugin and `persist: { path: [] }` (typo) is
      a compile error — with no `as any` / `as never` left in `persist.ts`
- [ ] Every store has `acceptHMRUpdate`: editing a store file keeps the cart filled
- [ ] The logger records **both** successful and failed actions with a duration —
      checked with `failureSwitch.products = true`
- [ ] Converting `addToCart` to `$patch` changes the mutation type in the log, and you
      saw it change

**You can explain**

- [ ] Why a getter taking an argument cannot be cached, and what the `Map` index
      replaces it with
- [ ] What breaks with `shallowRef` if some code mutates `products.value[0].price`, and
      how you would support that anyway
- [ ] Why splitting the store reduced re-renders — which dependency disappeared
- [ ] What `$onAction` sees that a `watch` on the state does not

## Going further

- Normalize the catalog (`byId` + `allIds`) and measure what changes when a
  single product is updated.
- Write a plugin that injects a shared `api` client into every store, and type it
  through `PiniaCustomProperties`.
- Compare your persistence plugin with `pinia-plugin-persistedstate`: what does
  it handle that yours does not?
