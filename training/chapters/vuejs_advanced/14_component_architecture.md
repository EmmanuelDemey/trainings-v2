---
layout: cover
---

# 14 - Component architecture & duplication

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Classify** a component by **what it is allowed to import**, not by how big it
  looks
- **Lay out** a feature-first `src/`, where deleting a feature means deleting one
  folder
- **Choose** between extracting a child component, a composable, or nothing at all
- **Use** slots so a new variant becomes a new caller instead of a new prop
- **Tell apart** the three kinds of duplication, and leave two of them alone
- **Apply** the rule of three, and recognise the wrong abstraction before it grows
  23 props

---

# The dependency rule

```
views/        route entry points: layout, data fetching, orchestration
   │ imports ↓
features/     domain components: InvoiceTable, PaymentForm, useInvoices
   │ imports ↓
ui/           domain-free: Button, Card, DataTable, Modal
   │ imports ↓
              the design system, and nothing else
```

- **`ui/`** never imports a store, a route, an API client or a domain type. Its
  props are primitives or **generic** types
- **`features/<domain>/`** owns everything about one domain — components, stores,
  composables, types — and never imports another feature
- **`views/`** is the only place allowed to know several domains at once

> The test, out loud: *"could I copy this file into a different product?"*
> `ui/` yes, `features/` no. That answer never changes with the design.

---

# The layout, feature-first

```
src/
  ui/                       ← domain-free, reusable across products
    DataTable/              index.vue, DataTable.test.ts, README.md
    Button.vue  Modal.vue  Card.vue
  features/
    invoicing/
      components/InvoiceRow.vue  InvoiceFilters.vue
      composables/useInvoices.ts
      stores/invoices.ts
      types.ts
      index.ts              ← the only entry point other code may import
    payments/  …
  views/
    InvoicesView.vue  DashboardView.vue
```

- Deleting a feature = deleting **one folder**. That is the real test of the split
- The atoms / molecules distinction disappears — `ui/` holds both, and nobody
  argues about which is which
- A component used by exactly one feature **stays in that feature**. Shared is
  earned, not assumed

---

# Component, composable, or nothing

| What repeats | Extract to | Why |
|---|---|---|
| Markup **and** its look | component in `ui/` | it has a visual contract |
| Behaviour, no markup | **composable** | the two callers render differently |
| Behaviour + several looks | composable + thin components | one behaviour, one wrapper per look |
| A pure computation | plain function in `utils/` | it needs no reactivity |
| Markup, no decision | a CSS class | a component would buy nothing |
| It happened **once** | nothing | see the rule of three, at the end of this chapter |

> The mistake that hurts most: extracting the **markup** when what repeated was the
> **behaviour**. You get three components with the same 40 lines of `<script setup>`.

---

# Slots, so variants stop being props

```vue
<!-- views/InvoicesView.vue -->
<DataTable :rows="invoices" :columns="columns">
  <template #toolbar><InvoiceFilters v-model="filters" /></template>
  <template #row="{ row }"><InvoiceRow :invoice="row" :selected="isSelected(row)" /></template>
  <template #empty>No invoice for this period</template>
</DataTable>
```

- `ui/DataTable.vue` owns **iteration, sorting, pagination, a11y** — and imports no
  domain type
- The caller owns **what a row looks like**
- A new variant is a new caller, not a new prop and not a copy of the table

> This is exactly the headless `DataTable` you built in workshop 7 — the same
> mechanism, now as an architectural rule rather than a Vue feature.

---

# Duplication — three kinds, one fix

| Kind | Example | What to do |
|---|---|---|
| **True** — identical, one reason to change | three copies of the same table, same product rules | unify: one component |
| **Shape-only** — looks alike, *different* reasons to change | `InvoiceRow` and `PaymentRow`: invoicing and payments are different teams, different roadmaps | leave duplicated; share only the `ui/` pieces |
| **Accidental** — the same five lines, unrelated | two `formatDate` calls | leave it alone |

<br />

> The question is never *"is this code identical?"*. It is
> **"will these two change together, always?"**

If the answer is *"probably"*, wait. If it is *"yes, they are the same rule"*,
unify — and put the rule in one place.

---

# The wrong abstraction

> *"Duplication is far cheaper than the wrong abstraction."* — Sandi Metz

The failure mode of an over-eager `ui/` layer:

1. Two components look alike → unify into `SmartTable`
2. Caller A needs one difference → add a prop
3. Caller B needs another → add a prop, and a `v-if` on the first one
4. Six months later: 23 props, and every change breaks a caller nobody expected

<br />

- **Rule of three**: unify on the third occurrence, not the second. The third is
  what shows you which parts actually vary
- The cheap exit from duplication is a shared **composable**, not a shared
  component: no rendering contract to keep compatible
- Un-abstracting is much harder than duplicating, so bias towards waiting

---

# Recap

- Classify by **what a file may import**, not by how big it looks — that question
  has one answer, and it survives the next redesign
- Three layers: `ui/` (domain-free), `features/<domain>/` (owns a domain),
  `views/` (knows several) — deleting a feature deletes **one folder**
- Behaviour repeats → composable. Markup **and** look repeat → component. It
  happened once → nothing
- Slots move the variants to the caller: a new look is a new caller, not a new prop
  and not a copy
- Duplication is only worth killing when the two copies will **always** change
  together — shape-only and accidental duplication stay
- Rule of three: unify on the third occurrence, never the second. Un-abstracting
  costs far more than duplicating

> The workshop for this chapter is `tp/14_component_architecture/`.

---

# Quiz — Question 1 / 3

**Which question best decides where a component belongs?**

- **A.** How many DOM elements does it render?
- **B.** What is this file allowed to import?
- **C.** How many times is it reused today?
- **D.** Does the designer call it a molecule?

<v-click>

> ✅ **B** — Imports are objective, stable across redesigns, and checkable by a
> linter. Size (**A**, **D**) is an opinion that changes with the next mock-up, and
> reuse count (**C**) tells you *if* it is shared, not what it may depend on.

</v-click>

---

# Quiz — Question 2 / 3

**Two components share 40 identical lines of `<script setup>` but render
completely differently. What do you extract?**

- **A.** A parent component they both wrap
- **B.** A composable
- **C.** A renderless component with a default slot
- **D.** Nothing — 40 lines is under the threshold

<v-click>

> ✅ **B** — What repeats is behaviour, so extract behaviour. **C** works but adds a
> component instance for nothing when no markup is shared, and **A** forces a
> rendering contract on two things that have none in common.

</v-click>

---

# Quiz — Question 3 / 3

**`InvoiceRow` and `PaymentRow` are nearly identical, but invoicing and payments
are two teams with two roadmaps. What is the right move?**

- **A.** Unify them into `TransactionRow` with a `type` prop
- **B.** Keep both, and share only the `ui/` pieces they use
- **C.** Copy whichever changes first back over the other
- **D.** Unify, and add props as the two diverge

<v-click>

> ✅ **B** — Same shape, different reasons to change: that is shape-only
> duplication. **A** and **D** are how a component reaches 23 props — every
> divergence becomes a prop and a `v-if` in a file two teams now share.

</v-click>

