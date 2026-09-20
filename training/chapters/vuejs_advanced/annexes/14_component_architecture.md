---
layout: cover
---

# Annexe — Component architecture

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

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

# Finding the duplication you already have

```bash
npx jscpd src --min-tokens 50 --reporters console          # .vue templates included
npx knip                                                   # dead files, unused exports
npx madge --circular --extensions ts,vue src               # import cycles = a broken layering
```

- `eslint-plugin-sonarjs`: `no-identical-functions`, `cognitive-complexity` — the
  two rules that actually flag copy-paste in `<script setup>`
- `unplugin-vue-components` (chapter 8): **half** the duplication in a mature app
  exists because nobody knew the component was already there. Auto-import plus a
  demo route for `ui/` fixes more duplication than any refactor
- Run `jscpd` in CI with a threshold, so the number can only go down

---

# Refactoring the obese organism

One step at a time, tests green in between — never a rewrite:

1. **Pin it** — one characterization test per mode (chapter 3). You cannot refactor
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

# Quiz — Question 1 / 2

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

# Quiz — Question 2 / 2

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

## Workshop 14 - Architecture & duplication — 45 min
