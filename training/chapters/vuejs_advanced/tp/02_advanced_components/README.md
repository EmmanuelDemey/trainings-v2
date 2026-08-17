# TP 2 — Advanced components

> This TP is **autonomous**: it does not depend on any other TP. Everything you
> need lives in this directory. The supporting components are provided and
> working; your job is to fill in the `// TODO` markers.

## Goal

Chapter 2 — Get hands-on with the four tools of the chapter, and **measure** what
each of them actually buys you:

- **Async components** — split a heavy panel out of the entry chunk, with a
  loading state, an error state and a retry strategy
- **`Suspense`** — one fallback for a subtree that awaits, plus the error path
  `Suspense` does *not* handle
- **Scoped slots** — a headless `DataTable` whose cells are rendered by the parent
- **Rendering performance** — a 2 000-row list: baseline, `shallowRef`, stable
  `key`, then `v-memo`

## Prerequisites

- **Node.js >= 22** — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

Keep the **Network tab** (filtered on JS) and the **Vue Devtools** open: most of
this workshop is about observing, not just writing.

## Steps

### 1. Async component — `src/components/ChartPanel.vue`

1. Replace the static import of `SalesChart` with `defineAsyncComponent`. Reload
   with the Network tab open and confirm a **new chunk** is fetched on "Show".
2. Switch to the object syntax: `loadingComponent: ChartSkeleton` with
   `delay: 200`, `errorComponent: ChartError` with `timeout: 5000`.
3. Add `onError(error, retry, fail, attempts)`: retry **once** on a chunk-loading
   error, `fail()` otherwise. To trigger the error path, set
   `failureSwitch.chart = true` in `src/api/fakeApi.ts`.
4. Throttle to "Slow 3G" and check the ordering: nothing for 200 ms, then the
   skeleton, then the chart.

### 2. `Suspense` — `src/components/ProfilePanel.vue`

1. Wrap `UserProfile` in a `<Suspense>` with `ProfileSkeleton` as `#fallback`.
2. Add `:key="userId"` and explain what changes when you remove it.
3. Catch the rejection of the top-level `await` with `onErrorCaptured` — a
   rejected async `setup` does **not** show the fallback. Test with
   `failureSwitch.profile = true`.
4. *(Bonus)* Use `@pending` / `@resolve` to disable the button while loading.

### 3. Scoped slots — `src/components/DataTable.vue` + `InvoiceTablePanel.vue`

1. Declare the slots with `defineSlots` (`cell` and an optional `empty`).
2. Render the `empty` slot when there is no row, guarded by `$slots.empty`.
3. Replace the raw cell output with a `cell` scoped slot exposing
   `{ row, column, value }`, keeping the raw value as fallback content.
4. In the panel, format `total` as a currency and render `status` as a coloured
   badge — **without touching `DataTable`**.
5. Check the typing: inside the slot, `row` must be `Invoice`, not `any`.

### 4. Rendering performance — `src/components/BigListPanel.vue`

1. **Measure the baseline**: click a few rows, note the re-render count and the
   duration displayed in the panel.
2. Switch `invoices` to `shallowRef`. Measure again.
3. Replace the index `:key` with `invoice.id`. Measure again.
4. Add `v-memo="[invoice.id === selectedId]"`. Measure again.
5. Deliberately break the `v-memo` array by using a reactive value you did not
   list, and observe the stale UI.

Write the four numbers down. The point of this step is the **ordering** of the
optimizations, not the final figure.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src | grep -v bonus` returns nothing
- [ ] No Vue warning or error in the browser console while you exercise the four panels

**The behaviour is there**

- [ ] `SalesChart` is **not** in the entry chunk: its chunk is fetched on "Show" only
- [ ] Throttled to Slow 3G: nothing for 200 ms, then the skeleton, then the chart
- [ ] With `failureSwitch.chart = true`: the Network tab shows **two** load attempts
      (one retry), then `ChartError` is rendered
- [ ] The `Suspense` fallback shows while the profile loads, and re-shows when you
      switch user (thanks to `:key`)
- [ ] With `failureSwitch.profile = true`: an error is rendered by `onErrorCaptured` —
      not the fallback, not a blank panel
- [ ] `DataTable` contains **no** invoice-specific code: `total` is formatted as a
      currency and `status` rendered as a badge entirely from the panel's `cell` slot
- [ ] The `empty` slot renders on an empty list, and the table still works when the
      parent provides no `empty` slot
- [ ] Inside the `cell` slot, `row` is typed `Invoice` — `row.nope` is a compile error
- [ ] The four measurements of step 4 are written down, in order: baseline →
      `shallowRef` → stable `key` → `v-memo`

**You can explain**

- [ ] Why an async component's code leaves the entry chunk, and what `delay` /
      `timeout` each protect against
- [ ] Why a rejected async `setup()` does not show the `#fallback`
- [ ] What removing `:key` on the `Suspense` boundary changes
- [ ] Why an incomplete `v-memo` array produces a stale UI — and why that makes
      `v-memo` the *last* optimization you reach for

## Going further

- Add `hydrate: hydrateOnVisible()` to the async chart and read the Vue 3.5 lazy
  hydration docs — it only takes effect under SSR, but the API is worth knowing.
- Replace the manual list with `vue-virtual-scroller` and compare with `v-memo`.
