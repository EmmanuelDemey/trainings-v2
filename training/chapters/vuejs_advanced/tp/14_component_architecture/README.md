# TP 14 — Component architecture & duplication

> This TP is **autonomous**: it does not depend on any other TP. The back office
> works, and it is laid out the way an app looks after eighteen months: a flat
> `components/`, a `ui/` that imports a store, two copies of the same table, and
> a `Badge` with eight props.
>
> This is the one workshop where **the tests come first and stay green**.
> `tests/views.spec.ts` passes before you touch anything, and has to pass after
> every step. That is the only thing separating a refactor from a rewrite.

## Goal

Chapter 14 — Classify by **what a file is allowed to import**, not by how big it
looks:

- The **dependency rule** — `views/` → `features/` → `ui/`, one way
- A **feature-first** layout, where deleting a feature is deleting one folder
- **Slots**, so a new variant is a new caller and not a new prop
- The **three kinds of duplication** — and the two you leave alone
- The **wrong abstraction**, caught before it grows 23 props

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode — keep it open for the whole refactor
```

Three spec files, and they do not play the same role:

| File | State | Role |
|---|---|---|
| `tests/views.spec.ts` | **green already** | the safety net — never edit it, never let it go red |
| `tests/architecture.spec.ts` | red | the dependency rule, as a test |
| `tests/dataTable.spec.ts` | red | the one table, and its slots |

> `architecture.spec.ts` reads the source tree. An architecture that lives only
> in a README drifts in a fortnight; this one fails the build.

## Where you are starting

```
src/
  ui/
    AppButton.vue      ← imports a store
    Badge.vue          ← imports Invoice AND Payment, eight props
    DataTable.vue      ← empty skeleton, nothing uses it
  components/
    InvoiceTable.vue   ← table + sorting + row, all in one
    PaymentTable.vue   ← the same file, renamed
    InvoiceFilters.vue
  stores/  api/  types.ts  ← shared by two domains that share nothing
  views/
```

## Steps

### 1. Split what is shared by two domains that share nothing

`types.ts`, `stores/` and `api/` each serve invoicing **and** payments. Move each
half into its own feature:

```
src/features/invoicing/   types.ts  api.ts  stores/invoices.ts  components/  index.ts
src/features/payments/    types.ts  api.ts  stores/payments.ts  components/  index.ts
```

`index.ts` is the **only** door: everything else imports `@/features/invoicing`,
never a file inside it. That is what makes the internals free to move — and what
the last architecture spec checks.

### 2. Clean out `ui/`

Ask it out loud, file by file: *could I copy this into a different product?*

- `AppButton.vue` imports a store. The count belongs to the caller — who already
  had it.
- `Badge.vue` imports `Invoice` and `Payment`. Bring it back to a coloured label:
  one `tone` prop and a slot. Each **caller** maps its own domain value to a
  tone, so invoicing and payments can disagree without this file knowing.

> Eight props was eight callers refusing to do that mapping themselves. That is
> the wrong abstraction, caught early — at 23 props it would have been a rewrite.

### 3. Build the one table — `src/ui/DataTable.vue`

```vue
<script setup lang="ts" generic="T extends { id: number }">
```

It owns iteration, sorting and the empty state. It takes `rows: T[]` and
`columns: Column[]`, and it offers three slots: `#toolbar`, `#row="{ row }"`,
`#empty`. A sortable header sorts ascending, then descending.

No domain type ever reaches this file.

### 4. Unify what is truly duplicated — and only that

`InvoiceTable.vue` and `PaymentTable.vue` hold two kinds of duplication, and they
do not get the same treatment:

| What | Kind | What to do |
|---|---|---|
| iteration, sorting, empty state | **true** — same markup, same reason to change | one `ui/DataTable.vue` |
| the cells of a row | **shape-only** — two teams, two roadmaps | keep both: `InvoiceRow.vue`, `PaymentRow.vue` |
| `euros()`, copied three times | a pure computation | `utils/money.ts` |

Then delete both table files and have the views call `DataTable` with their own
`#row`.

> The question is never *"is this code identical?"*. It is **"will these two
> change together, always?"** If the answer is "probably", wait.

### 5. Wire the views

A view is the only layer allowed to know several layers at once. It composes the
`ui/` table with the feature's row and toolbar — and that is all it does.

### 6. *(Bonus)* Prove the layout

Delete `src/features/payments/` and `views/PaymentsView.vue`, and run
`npm run typecheck`. If anything else breaks, the split is not done.
Then `git checkout` it back.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the seventeen specs
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] `tests/views.spec.ts` was **never edited**, and never went red for more than
      one step

**The layout**

- [ ] `src/components/`, `src/stores/`, `src/api/` and `src/types.ts` are gone
- [ ] Each feature has its own `types.ts`, `api.ts`, store, components and `index.ts`
- [ ] No file imports another feature
- [ ] Nothing outside a feature reaches past its `index.ts`
- [ ] Nothing in `ui/` imports a store, an API, a view or a domain type

**The components**

- [ ] `ui/DataTable.vue` is generic, and offers `#toolbar`, `#row` and `#empty`
- [ ] Both views render **the same** `DataTable`
- [ ] `InvoiceRow` and `PaymentRow` both exist — on purpose
- [ ] `Badge` has **one** prop and a slot
- [ ] `euros()` lives in exactly one place

**You can explain**

- [ ] The out-loud test that tells `ui/` from `features/`
- [ ] Which duplication you removed, which you kept, and why
- [ ] What a new "archived invoices" table would cost now, and what it cost before
- [ ] Why the safety-net specs assert on `data-testid` and not on component names

## Going further

- Add a third feature (`subscriptions/`) with its own row, and count how many
  existing files you had to touch. That number is the score of this refactor.
- Enforce the dependency rule at build time with `dependency-cruiser` or an
  ESLint `no-restricted-imports`, and compare it with the spec you now have.
- Give `DataTable` pagination. Notice that neither feature has to change.
- Take the rule of three seriously: find something in this app extracted after
  **one** usage, and inline it back.
