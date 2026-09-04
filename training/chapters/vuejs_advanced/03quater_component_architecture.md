---
layout: cover
---

# 3quater - Component architecture & duplication

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Diagnose** why an atoms / molecules / organisms split stopped deciding anything
- **Replace** the size-based taxonomy with a **dependency rule** — and have a linter
  enforce it
- **Split** a component on objective signals, and recognise when splitting makes
  things worse
- **Choose** between extracting a child component, a composable, or nothing at all
- **Kill** the props explosion with slots, generics and compound components
- **Tell apart** the three kinds of duplication, and leave two of them alone
- **Refactor** an oversized component in a fixed order, without a rewrite

---

# The symptom

```
src/components/
  atoms/       BaseButton.vue  BaseCard.vue  StatusDot.vue  Price.vue
  molecules/   InvoiceRow.vue  SearchBar.vue  UserBadge.vue
  organisms/   InvoiceTable.vue  ClientTable.vue  PaymentTable.vue
```

- `atoms/Price.vue` imports `useSettingsStore()` to read the currency
- `organisms/InvoiceTable.vue` is 780 lines and takes **23 props**
- `ClientTable.vue` and `PaymentTable.vue` *are* `InvoiceTable.vue`, copied eight
  months ago, then drifted
- Nobody can answer *"is this new component a molecule or an organism?"* — so it
  lands in `organisms/`, which is now 60 % of the folder

> The layers are still there. They stopped deciding anything — and the duplication
> grew anyway.

---

# Why the taxonomy drifts

Atomic design classifies by **visual size**. Size is not a property of the code: it
is subjective, it changes with the next design, and it says nothing about what a
file is allowed to do.

| Question the taxonomy is asked | What it answers |
|---|---|
| Is a `<SearchBar>` with a dropdown a molecule or an organism? | An opinion |
| May `Price.vue` read the settings store? | *nothing* |
| Where does the invoice-specific table go? | *nothing* |
| Can I reuse this in the other product? | *nothing* |

<br />

The question that has **one** answer, never depends on the design, and can be
checked by a machine:

> **What is this file allowed to import?**

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

# The rule you do not enforce is a comment

```js
// eslint.config.js
{
  files: ['src/ui/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/features/*', '@/stores/*', '@/api/*', '@/views/*'],
          message: 'ui/ is domain-free: take the data as a prop.' },
      ],
    }],
  },
},
{
  files: ['src/features/*/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['@/features/*/!(index).*'],
        message: 'Cross-feature import: go through the feature barrel, or lift to views/.' }],
    }],
  },
}
```

- Twenty lines, once. From then on the boundary is checked on **every PR**
- `eslint-plugin-boundaries` does the same with named layers if you prefer

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

# Where the component library sits

Quasar, PrimeVue, Vuetify already *are* your `ui/` layer. Wrapping every one of
their components "in case we migrate" costs a file, a props API and a bug surface
per component — and the migration you are insuring against will not be saved by
those wrappers anyway.

Wrap **on purpose**, when there is a decision inside:

| Wrap | Why |
|---|---|
| `ui/AppButton.vue` around `QBtn` | you always pass 4 identical props (`unelevated`, size, colour) |
| `ui/ConfirmDialog.vue` around `QDialog` | the a11y wiring and the promise-based API are yours |
| `ui/MoneyInput.vue` around `QInput` | parsing, masking and the `defineModel` contract are business rules |

- Anything else: import `QCard` directly in the feature and move on
- If the wrapper only forwards `v-bind="$attrs"` and re-exports the slots, delete it

---

# When to split — the signals that decide

In order of reliability:

1. **Two reasons to change** — the file is touched by a design ticket *and* by a
   business rule. That is one component too many
2. **A branch nobody shares** — `v-if="mode === 'compact'"` guarding half the
   template: two components wearing one name
3. **The name contains an "and"** — `UserProfileAndSettings`
4. **Reuse actually happened, twice** — not "will be reused"

<br />

Smoke alarms, not laws — measure them, but do not let them decide:

> more than ~150 template lines · more than ~10 props · more than 2 `mode` values
> · a `<script setup>` longer than its `<template>`

---

# When *not* to split

```vue
<!-- ui/AppTitle.vue — the whole file -->
<template><h1 class="text-xl font-bold"><slot /></h1></template>
```

Twelve of these is not an architecture, it is an indirection tax:

- A props API to maintain and document, for zero decision
- `grep "text-xl"` no longer finds where the title is styled
- Every design change now edits a file **and** its six callers

> Extract when there is a **decision** inside — logic, state, a11y wiring,
> a formatting rule. Not when there is only markup.

Markup that repeats and carries no decision is what CSS classes and `<slot>` are
for.

---

# Component, composable, or nothing

| What repeats | Extract to | Why |
|---|---|---|
| Markup **and** its look | component in `ui/` | it has a visual contract |
| Behaviour, no markup | **composable** | the two callers render differently |
| Behaviour + several looks | composable + thin components | chapter 3's renderless pattern |
| A pure computation | plain function in `utils/` | it needs no reactivity |
| Markup, no decision | a CSS class | a component would buy nothing |
| It happened **once** | nothing | see the rule of three, two slides on |

> The mistake that hurts most: extracting the **markup** when what repeated was the
> **behaviour**. You get three components with the same 40 lines of `<script setup>`.

---

# The props explosion

```vue
<InvoiceTable
  :invoices="invoices" compact hide-header selectable
  :with-actions="canEdit" :sticky="false" dense borderless
  :highlight-overdue="true" />
```

Eight booleans is **256** combinations you are implicitly claiming to support, and
three you have ever tested. Each one is a `v-if` in the template of a file nobody
wants to open.

The tell: a prop that only exists so **one** caller can hide **one** thing.

> A boolean prop describes *what the caller wants removed*. A slot lets the caller
> describe *what it wants instead* — and the component stops guessing.

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

> This is exactly the headless `DataTable` you built in workshop 2 — the same
> mechanism, now as an architectural rule rather than a Vue feature.

---

# One generic component instead of three copies

```vue
<script setup lang="ts" generic="T extends { id: string | number }">
import type { Column } from './column';

defineProps<{ rows: T[]; columns: Column<T>[] }>();
defineSlots<{
  toolbar?(): unknown;
  row(props: { row: T }): unknown;
  empty?(): unknown;
}>();
const emit = defineEmits<{ select: [row: T] }>();
</script>
```

- `InvoiceTable`, `ClientTable` and `PaymentTable` collapse into **one** file, and
  the callers keep full type inference on `row`
- `defineSlots` makes the slot contract the thing you maintain — a caller passing
  the wrong shape fails `vue-tsc`, not production
- No `any`, no `Record<string, unknown>`: generics are what let `ui/` stay
  domain-free **without** losing types

---

# Compound components, when the family is real

```ts
// ui/Tabs/context.ts
export interface TabsContext { active: Ref<string>; register(id: string): void }
export const tabsKey = Symbol('tabs') as InjectionKey<TabsContext>;
```

```vue
<Tabs v-model="current">
  <Tab id="details">…</Tab>
  <Tab id="history">…</Tab>
</Tabs>
```

- `Tabs` provides, `Tab` injects — no props threaded through the middle
- Use it when children are **meaningless outside** the parent (tabs, accordion,
  table columns, form field groups)
- Do **not** use it as a general escape from prop drilling: an injection nobody can
  see in the template is harder to follow than three props. Three levels of drilling
  is a smell; two is fine

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

# Finding the duplication you already have

```bash
npx jscpd src --min-tokens 50 --reporters console          # .vue templates included
npx knip                                                   # dead files, unused exports
npx madge --circular --extensions ts,vue src               # import cycles = a broken layering
```

- `eslint-plugin-sonarjs`: `no-identical-functions`, `cognitive-complexity` — the
  two rules that actually flag copy-paste in `<script setup>`
- `unplugin-vue-components` (chapter 5bis): **half** the duplication in a mature app
  exists because nobody knew the component was already there. Auto-import plus a
  demo route for `ui/` fixes more duplication than any refactor
- Run `jscpd` in CI with a threshold, so the number can only go down

---

# Refactoring the obese organism

One step at a time, tests green in between — never a rewrite:

1. **Pin it** — one characterization test per mode (chapter 4). You cannot refactor
   what you cannot re-run
2. **Move behaviour out** — everything that is not markup goes into composables. The
   file shrinks by half without a single `<div>` moving
3. **Name the branches** — give every `v-if` mode a name. Two modes sharing nothing
   are two components
4. **Push markup down** — extract the leaves that carry a decision: domain-free ones
   to `ui/`, the rest to `features/<domain>/`
5. **Slots for variants** — replace boolean props with slots, **one prop per commit**
6. **Delete** — remove each dead branch, run the tests
7. **Fence it** — add the file's folder to the lint rule, so it cannot import
   upwards again

> Budget honestly: a 780-line organism is 2–3 days. Do it the next time that file
> has to change — not in a "refactor sprint" nobody will fund twice.

---

# Definition of done, for anything landing in `ui/`

- Imports no store, no route, no API client, no domain type — the lint rule proves it
- Props are primitive or **generic**; no `any`, no `Record<string, any>` escape hatch
- Variants go through **slots**, not booleans
- Emits and slots are declared with `defineEmits` / `defineSlots`
- A demo route or story renders **every slot** — this is what stops the next copy
- A test on the **contract** (emits, slot props, keyboard), not on the markup
- One line in the team's component index, with the reason it exists

> If a component cannot meet this list, it is not shared — it belongs to the
> feature that needed it.

---

# Anti-patterns

- **`components/common/`** — the folder for things nobody classified. It only grows
- **`Base` everywhere** — `BaseCard`, `BaseBaseInput`. A prefix does not create a
  layer; an import rule does
- **Wrapping the whole component library** in case you migrate one day
- **`v-bind="$attrs"` four levels deep** — the props are invisible and the types are
  gone
- **A store to avoid prop drilling** — global state as a courier service; use
  `provide` / `inject`, or lift the component
- **Splitting to satisfy a line-count lint rule** — you get the same complexity in
  six files, plus the indirection
- **`features/` that import each other** — the moment this is allowed, the folders
  are decoration

---

# Recap

- Classify by **what a file may import**, not by how big it looks — that question
  has one answer, and ESLint can check it
- Three layers: `ui/` (domain-free), `features/<domain>/` (owns a domain),
  `views/` (knows several)
- Split on **two reasons to change**, not on line count. Extract only what contains
  a decision
- Behaviour repeats → composable. Markup **and** look repeat → component. Once →
  nothing
- Slots and generics are what let one component replace three copies without
  growing 23 props
- Duplication is only worth killing when the two copies will **always** change
  together — the rule of three, and never on the second occurrence

> Next: chapter 4 turns step 1 of the refactoring recipe — pinning the behaviour —
> into actual tests.

---

# Quiz — Question 1 / 5

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

# Quiz — Question 2 / 5

`ui/Price.vue` needs the user's currency, currently read from a Pinia store.
**What do you do?**

- **A.** Import the store — it is only one import
- **B.** Take `currency` as a prop, and let the caller read the store
- **C.** Move `Price.vue` into `features/settings/`
- **D.** Inject the store through `provide` so the import is not visible

<v-click>

> ✅ **B** — A domain-free component receives its data. **A** and **D** both make
> `ui/` depend on the app (the injection just hides it from the linter), and **C**
> gives up on the component being reusable at all.

</v-click>

---

# Quiz — Question 3 / 5

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

# Quiz — Question 4 / 5

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

---

# Quiz — Question 5 / 5

**Where does the refactoring of a 780-line organism start?**

- **A.** Split the template into six child components
- **B.** Write a characterization test per mode
- **C.** Replace the boolean props with slots
- **D.** Move it out of `organisms/` into the right layer

<v-click>

> ✅ **B** — Every other step changes behaviour you cannot currently observe.
> **A**, **C** and **D** are steps 4, 5 and 7 — they are safe *only* once the tests
> can tell you that you broke something.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 3quater - Architecture & duplication — 45 min

Work in `tp/02_advanced_components`, whose components all sit flat in
`src/components/`:

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

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
