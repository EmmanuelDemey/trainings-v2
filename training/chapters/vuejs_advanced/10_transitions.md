---
layout: cover
---

# 10 - Transition & TransitionGroup

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Animate** an element entering *and* leaving the DOM with the built-in
  `<Transition>`, without writing a single import
- **Name** the six transition classes, place them on the enter / leave timeline,
  and namespace them with the `name` prop
- **Choose** between the default mode, `out-in` and `in-out`, and say what each
  one does to the layout
- **Animate** insertions, removals *and* reordering of a list with
  `<TransitionGroup>` and the `v-move` class
- **Explain** FLIP, and why reordering needs a stable `key` on every child and a
  leaving element taken out of the flow

---

# The smallest possible example

```vue
<template>
  <button type="button" @click="visible = !visible">Toggle</button>

  <Transition>
    <p v-if="visible">Saved ✓</p>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active { transition: opacity 0.25s ease; }

.v-enter-from,
.v-leave-to     { opacity: 0; }
</style>
```

- `<Transition>` is a **built-in** component: no import, no registration
- It renders **no element of its own** — only its child
- Without a `name`, the classes are prefixed with `v-`. `<Transition name="fade">`
  swaps that prefix for `fade-` on all six — it is only a namespace, nothing else
  changes

---

# The six classes

| Class | Added | Removed |
|---|---|---|
| `v-enter-from` | before insertion | one frame after insertion |
| `v-enter-active` | before insertion | when the transition ends |
| `v-enter-to` | one frame after insertion | when the transition ends |
| `v-leave-from` | when leaving starts | one frame later |
| `v-leave-active` | when leaving starts | when the transition ends |
| `v-leave-to` | one frame later | when the transition ends |

<br />

- `*-from` = the **starting** state, `*-to` = the **ending** state
- `*-active` = the state during the whole phase — this is where the
  `transition` / `animation` declaration lives (duration, easing, delay)

---

# Transition modes

```vue
<Transition mode="out-in">
  <component :is="currentTab" />
</Transition>
```

| Mode | Behaviour | When |
|---|---|---|
| *(default)* | Enter and leave run **at the same time** | Elements that do not share space (a toast, an overlay) |
| `out-in` | The old one leaves, **then** the new one enters | Almost always, for content that replaces content |
| `in-out` | The new one enters, **then** the old one leaves | Rare — a card flip, a cross-fade over a fixed background |

<br />

> Without a mode, both elements are in the DOM together for a moment: they stack,
> the layout jumps. `out-in` is the fix you will reach for 90% of the time — at
> the cost of a total duration that is the **sum** of the two phases.

---

# `<TransitionGroup>` — many children at once

```vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.label }}</li>
</TransitionGroup>
```

What changes compared to `<Transition>`:

| | `<Transition>` | `<TransitionGroup>` |
|---|---|---|
| Children | Exactly one | A list |
| Wrapper element | Never | None by default, `tag="ul"` to render one |
| `key` | Optional | **Required and unique** on every child |
| `mode` | `out-in` / `in-out` | ❌ Not supported |
| Extra class | — | `v-move` |

- The enter / leave classes are applied to **each child individually**

---

# `v-move` — animating the reordering

```css
.list-enter-active,
.list-leave-active,
.list-move          { transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1); }

.list-enter-from,
.list-leave-to      { opacity: 0; transform: translateX(30px); }

/* Take the leaving item out of the flow, so the others can slide */
.list-leave-active  { position: absolute; }
```

- `v-move` is applied to every element whose **position changed** — sorting,
  filtering, shuffling
- It is implemented with **FLIP**: Vue measures the position before (First) and
  after (Last), applies an inverse `transform` (Invert), then removes it and lets
  the CSS transition Play

---

# Recap

| Tool | Use it for | Watch out for |
|---|---|---|
| `<Transition>` | One element entering / leaving | Exactly one child, and no wrapper element of its own |
| `*-from` / `*-active` / `*-to` | The six classes of a phase | The `transition` declaration lives on `*-active` |
| `name` | Namespacing the six classes | Without it, the prefix is `v-` |
| `mode="out-in"` | Replacing content | Doubles the total duration |
| `<TransitionGroup>` | Lists: insert, remove, reorder | `key` required, no `mode`, `tag` to render a wrapper |
| `v-move` | The FLIP reordering | Needs `position: absolute` on `*-leave-active` |

<br />

> The workshop for this chapter is `tp/10_transitions/`.

---

# Quiz — Question 1 / 2

**A tab bar swaps `<component :is="currentTab" />`. During the switch the two
views stack and the page height jumps. What is missing?**

- **A.** A `key` on the component
- **B.** `mode="out-in"` on the `<Transition>`
- **C.** `appear`
- **D.** `:duration` set explicitly

<v-click>

> ✅ **B** — Without a mode, the leaving and the entering elements are in the DOM
> **at the same time** and both take up space. `out-in` plays the leave first, then
> the enter — at the cost of a total duration that is the sum of the two.

</v-click>

---

# Quiz — Question 2 / 2

**In a `<TransitionGroup>`, items fade in and out correctly, but the remaining
items snap to their new position instead of sliding. What is wrong?**

- **A.** `mode="out-in"` is missing
- **B.** No `v-move` transition, or the leaving item still occupies the flow
- **C.** The `tag` prop is missing
- **D.** The children need `appear`

<v-click>

> ✅ **B** — Sliding needs a `transition` on the `*-move` class **and** a leaving
> element removed from the flow (`position: absolute` on `*-leave-active`), so the
> others can move before the leave animation ends. And FLIP needs a stable `key` on
> every child. **A** is impossible: `<TransitionGroup>` does not support `mode`.

</v-click>

