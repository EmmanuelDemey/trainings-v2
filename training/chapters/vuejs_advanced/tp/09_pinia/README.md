# TP 9 — Pinia

> This TP is **autonomous**: it does not depend on any other TP. The app works as
> shipped — it is just built the way real projects end up after a while. Your job
> is to fix it, measuring at every step.

## Goal

Chapter 9 — Take a working "god store" and turn it into something that scales:

- **Split** one store into three, by domain, and watch wasted re-renders disappear
- **`shallowRef`** for a large payload that is never mutated in place
- **A persistence plugin** with an opt-in, typed store option
- **An observability plugin** built on `$onAction` and `$subscribe`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The **Vue Devtools** browser extension (Pinia tab + Timeline)

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Steps 3 and 4 come with their specs already written: **`tests/stores.spec.ts`**
covers the two plugins — what the cart persists and what it must not, a corrupted
entry that cannot take startup down, and the log of a successful **and** of a
failed action. It is red on the skeleton; keep `npm run test:watch` in a second
terminal.

It drives the panels rather than the stores, on purpose: the three stores of step
1 do not exist yet, so a spec importing `useCatalogStore` would fail to *load*
rather than fail an assertion. The measurements — `shallowRef` and the render
counters — stay where they belong, in the browser with the numbers written down.

Every panel displays its own **render counter** and the app displays the cost of
the catalog assignment. Write the numbers down before each change.

**Already done for you** in `src/stores/shop.ts`, so that you carry them over
when you split it rather than write them:

- **A `Map` index** — `byId` is a `computed` returning a `Map`, where a getter
  taking an argument (`productById(id)`) was O(n) per cart line and never cached.
- **HMR** — `acceptHMRUpdate` below the store: editing a store file swaps it in
  place and keeps the cart filled.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Split the god store into three domain stores | `src/stores/shop.ts` → `catalog.ts`, `cart.ts`, `ui.ts` | Reloading the catalog stops moving `ThemePanel`'s counter |
| 2 | Stop making a big payload deeply reactive | `src/stores/catalog.ts` | The assignment duration drops on a 30 000-product catalog |
| 3 | Write the persistence plugin | `src/plugins/persist.ts` + `pinia.d.ts` | `npm test` — the cart survives a reload, the catalog does not |
| 4 | Write the observability plugin | `src/plugins/logger.ts` | `npm test` — a successful *and* a failed action are logged |

Steps 3 and 4 are the ones `npm test` grades. Steps 1 and 2 are graded by the
render counters and the timings in the browser — which is why you write the
numbers down.

## Steps

### 1. Split the store — `src/stores/shop.ts` → three files

1. Extract `useCatalogStore`, `useCartStore` and `useUiStore` into three files.
   `useCartStore` gets the catalog by calling `useCatalogStore()` inside its
   setup function. `byId` goes to the catalog, and each store keeps its own
   `acceptHMRUpdate` block.
2. Keep the app working as you go — update the components' imports.
3. Point `ThemePanel` at `useUiStore` and confirm its render counter stops moving
   when you reload the catalog.

**Baseline to beat**: load a 10 000-product catalog and note how many times
`ThemePanel` re-rendered.

→ **Done when** the app still works, nothing imports `src/stores/shop.ts` any
more, and reloading the catalog leaves `ThemePanel`'s counter still.

### 2. `shallowRef` — `src/stores/catalog.ts`

Switch `products` to `shallowRef` and reload a 30 000-product catalog. Compare
the "assignment" duration displayed in the panel.

Then answer: what would break if some code mutated `products.value[0].price`
directly, and how would you make it work anyway?

→ **Done when** you have the assignment duration before and after, measured on
the same 30 000-product catalog.

### 3. The persistence plugin — `src/plugins/persist.ts` + `src/plugins/pinia.d.ts`

1. Bail out when `options.persist` is falsy.
2. Restore the state from `localStorage` on creation, guarding the JSON parse.
3. Persist on every mutation with `$subscribe`.
4. Type the custom option in `src/plugins/pinia.d.ts` and remove every cast.

**Check it**: fill the cart, reload the page, and confirm it comes back — while
the catalog does **not** (it is not marked `persist`).

→ **Done when** the persistence specs are green and no cast is left in
`persist.ts`.

### 4. The logger plugin — `src/plugins/logger.ts`

1. Measure every action with `$onAction`, recording both success and failure.
   Trigger a failure with `failureSwitch.products = true`.
2. Log the mutation type with `$subscribe`, then convert `addToCart` to `$patch`
   and watch the type change.
3. *(Bonus)* Expose the log on every store as `$actionLog` and type it.

→ **Done when** the action-log specs are green: a successful **and** a failed
action, each with a duration.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the persistence plugin and the action log
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
- [ ] Filling the cart and reloading brings the cart back — and the catalog **does not**
- [ ] A corrupted `localStorage` entry does not break app startup
- [ ] `src/plugins/pinia.d.ts` declares `DefineStoreOptionsBase.persist`, so
      `options.persist` is typed inside the plugin and `persist: 'yes'` is a compile
      error — with no `as any` / `as never` left in `persist.ts`
- [ ] Every store kept its `acceptHMRUpdate`: editing a store file keeps the cart filled
- [ ] The logger records **both** successful and failed actions with a duration —
      checked with `failureSwitch.products = true`
- [ ] Converting `addToCart` to `$patch` changes the mutation type in the log, and you
      saw it change

**You can explain**

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
