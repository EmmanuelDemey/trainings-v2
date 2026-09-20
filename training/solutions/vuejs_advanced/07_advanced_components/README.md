# TP 7 — Advanced components

> This TP is **autonomous**: it does not depend on any other TP. Everything you
> need lives in this directory. The supporting components are provided and
> working; your job is to fill in the `// TODO` markers.

## Goal

Chapter 7 — Get hands-on with the four tools of the chapter, and **measure** what
each of them actually buys you:

- **Async components** — split a heavy panel out of the entry chunk, with a
  loading state, an error state and a retry strategy
- **`Suspense`** — one fallback for a subtree that awaits, plus the error path
  `Suspense` does *not* handle
- **Scoped slots** — a headless `DataTable` whose cells are rendered by the parent
- **`Teleport`** — a modal that escapes a clipping ancestor, `:disabled` to bring
  it back, and `defer` for a target rendered by the app itself
- **Rendering performance** — a 2 000-row list: baseline, `shallowRef`, stable
  `key`, then `v-memo`

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

Steps 2, 3 and 5 come with their specs already written:
**`tests/components.spec.ts`** covers the `Suspense` fallback and its `:key`, the
error of a rejected async `setup()`, both slots of the headless table, and the
dialog that escapes the clipping panel without losing what you typed. It is red
on the skeleton.

Steps 1 and 4 are **not** in there, deliberately. "The chart is not in the entry
chunk" is a claim about the *bundle*, which jsdom cannot see — a green test would
prove nothing about what a user downloads. And step 4 is judged on the four
measurements you write down. Those two live in the Network tab and in your notes.

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

### 5. `Teleport` — `src/components/AppModal.vue`

The panel of this step carries `overflow: hidden` **and** a `transform`: the
dialog is clipped, and its `position: fixed` is resolved against the panel
instead of the viewport. Open the modal once before changing anything — the bug
is the point of departure.

1. Wrap the backdrop in a `<Teleport to="body">`. Check in the **Elements** tab
   that the nodes moved to the end of `<body>`, and that the dialog is centred
   again — with no CSS change.
2. Bind `:disabled="inline"` on the teleport. Type something in the "Reason"
   field, then tick the checkbox **inside the dialog**: the nodes move back into
   the panel, and the input keeps its value.
3. Retarget the teleport at `#modal-root` — the container `App.vue` renders
   *after* the panels. Reload: Vue warns that the target cannot be found. Add the
   `defer` prop (Vue 3.5) and reload again.
4. Explain the warning: when is `to` resolved, and why does keeping the `v-if`
   *inside* the teleport (rather than on it) make the problem visible?
5. *(Bonus)* Close on `Escape` and focus the dialog on open — `Teleport` moves
   the DOM, never the focus.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — `Suspense`, the scoped slots and the `Teleport`
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
- [ ] The open modal is a child of `#modal-root` in the Elements tab, is centred on
      the viewport and is not clipped by the panel
- [ ] Toggling `:disabled` while the modal is open moves the nodes **without**
      losing the content of the "Reason" field
- [ ] With `defer`, no "Failed to locate Teleport target" warning is logged at
      startup

**You can explain**

- [ ] Why an async component's code leaves the entry chunk, and what `delay` /
      `timeout` each protect against
- [ ] Why a rejected async `setup()` does not show the `#fallback`
- [ ] What removing `:key` on the `Suspense` boundary changes
- [ ] Why an incomplete `v-memo` array produces a stale UI — and why that makes
      `v-memo` the *last* optimization you reach for
- [ ] When a `Teleport` resolves its `to` target, and what `defer` changes

## Going further

- Add `hydrate: hydrateOnVisible()` to the async chart and read the Vue 3.5 lazy
  hydration docs — it only takes effect under SSR, but the API is worth knowing.
- Replace the manual list with `vue-virtual-scroller` and compare with `v-memo`.
- Rewrite the modal on top of the native `<dialog>` element (`showModal()` gives
  you the top layer, the backdrop and the focus trap for free) and decide whether
  the teleport is still needed.

## Later in the training

2 later chapters come back to this same project, each with its own session and its own *Done when*. Follow the training order — each one builds on the state the previous left behind.

### Chapter 10 — Transition & TransitionGroup (45 min)

Continue in this project, on top of the `Teleport` modal and the row list:

1. Animate the modal: **backdrop fading**, panel **scaling in** — and check in the
   Devtools that the six classes appear in the expected order
2. Give the leave phase **half** the duration of the enter phase, then compare
   with a symmetric version. Which one feels faster?
3. Wrap it as a reusable `<ModalTransition>` forwarding `$attrs`, and use it in
   two places
4. Turn the row list into a **`<TransitionGroup>`**: add, remove and shuffle rows,
   then make the reordering slide with `*-move` and `position: absolute`
5. Replace the CSS with **JS hooks + `:css="false"`** and stagger the entering
   rows by their index — cancel the running animation in `@enter-cancelled`
6. Add a `prefers-reduced-motion` block, toggle the preference in the Devtools
   rendering panel, and verify **nothing gets stuck** in the DOM
7. *(Bonus)* Measure the FLIP cost on 500 rows in the Performance panel, then on
   50 — and decide where your limit is

**Done when** every animation is reversible mid-flight, and disabling motion
leaves the application fully usable.

### Chapter 14 — Architecture & duplication (45 min)

Work in this project, whose components all sit flat in `src/components/`:

1. Create `src/ui/`, `src/features/invoicing/` and `src/views/`, then move each
   existing component into the layer its **imports** dictate — `InvoiceRow.vue`
   imports `Invoice`, so it is not `ui/`
2. Add the `no-restricted-imports` rule for `src/ui/**` and run ESLint. Fix every
   violation by **passing data in**, not by relaxing the rule
3. Give `features/invoicing/` an `index.ts` barrel, and make `views/` import only
   through it
4. Find the duplication: `npx jscpd src --min-tokens 50`. For each hit, label it
   **true**, **shape-only** or **accidental** — and only fix the first kind
5. Take one panel component and list its props. For each, answer *"does a slot
   express this better?"* — convert at least one boolean prop into a slot
6. Prove the layering holds: `npx madge --circular --extensions ts,vue src` must
   report nothing
7. *(Bonus, on your own project)* Run steps 1, 2 and 4 on a folder of your real
   application, and bring the ESLint output to the group — the violations are the
   architecture review

**Done when** `ui/` imports nothing from `features/`, `views/` or `api/`, ESLint
and `vue-tsc` are green, `madge` finds no cycle, and you can say out loud, for each
`jscpd` hit, why you did or did not unify it.
