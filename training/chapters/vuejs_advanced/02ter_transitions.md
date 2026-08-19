---
layout: cover
---

# 2ter - Transition & TransitionGroup

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why CSS alone cannot animate an element that leaves the DOM, and
  what `<Transition>` adds on top of it
- **Name** the six transition classes and place them on the timeline of an
  enter / leave sequence
- **Choose** between the default mode, `out-in` and `in-out`, and say what each
  one does to the layout
- **Delegate** the animation to JavaScript with the hooks and `:css="false"`,
  for GSAP, Motion or any imperative library
- **Animate** insertions, removals *and* reordering of a list with
  `<TransitionGroup>` and the FLIP `v-move` class
- **Respect** `prefers-reduced-motion`, and keep animations on the compositor
- **Debug** the classic "nothing happens" cases: missing key, several roots,
  `display: inline`, a transition that never ends

---

# The problem CSS cannot solve alone

```vue
<template>
  <p v-if="visible">Saved ✓</p>
</template>
```

- Entering is *almost* fine: the element appears, a CSS animation can play
- Leaving is **impossible**: `v-if` removes the node from the DOM immediately —
  there is nothing left to animate

<br />

`<Transition>` solves exactly one thing: it **keeps the element alive** until the
animation you declared has finished, and it tells you where you are in the
sequence by **adding and removing classes**.

> It is a *coordinator*, not an animation engine. The animation itself is still
> plain CSS — or plain JavaScript.

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
- Without a `name`, the classes are prefixed with `v-`

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

# The enter timeline, frame by frame

```
                   ┌ insert in the DOM
                   │           ┌ next frame          ┌ transitionend
                   ▼           ▼                     ▼
 v-enter-from      ███████████
 v-enter-active    ██████████████████████████████████
 v-enter-to                    ███████████████████████
```

- Vue inserts the element **already carrying** `enter-from` + `enter-active`
- It waits **one frame** so the browser paints the starting state — this is what
  makes the transition actually run instead of jumping to the end
- Then it swaps `enter-from` for `enter-to`: the browser interpolates between the
  two, driven by `enter-active`

> The leave phase is the exact mirror image, starting from `leave-from`.

---

# Naming a transition

```vue
<Transition name="fade">
  <p v-if="visible">Saved ✓</p>
</Transition>
```

```css
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }

.fade-enter-from,
.fade-leave-to     { opacity: 0; }
```

- `name="fade"` replaces the `v-` prefix by `fade-` on the six classes
- Nothing else changes — this is only a namespace

<br />

- `:name` is **dynamic**: `<Transition :name="direction">` is how per-route
  slide transitions are built (chapter 5)

---

# Enter and leave do not have to match

```css
/* Enter: slide down and fade in, generously */
.slide-enter-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from   { opacity: 0; transform: translateY(-16px); }

/* Leave: get out of the way, fast */
.slide-leave-active { transition: all 0.15s ease-in; }
.slide-leave-to     { opacity: 0; transform: translateY(8px); }
```

- The two phases are declared **independently** — different durations, different
  easings, different properties
- A common, good default: **enter slowly, leave quickly**. The user is waiting for
  the new content, not for the old one

---

# CSS animations work too

```css
.bounce-enter-active { animation: bounce-in 0.5s; }
.bounce-leave-active { animation: bounce-in 0.5s reverse; }

@keyframes bounce-in {
  0%   { transform: scale(0); }
  50%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}
```

- With `@keyframes`, the `*-from` and `*-to` classes are usually **unnecessary**:
  the keyframes already describe the start and the end
- Vue listens for `animationend` instead of `transitionend`

> Use a `transition` for a state change (A → B), an `animation` when the path
> between the two matters (bounce, shake, pulse).

---

# How Vue knows the animation is over

- Vue **sniffs** the element: it reads the computed `transition-duration` /
  `animation-duration` and listens for the matching end event
- The **longest** declared duration wins

<br />

Two escape hatches when the detection guesses wrong:

```vue
<!-- Both a transition and an animation on the element: say which one to watch -->
<Transition type="animation">…</Transition>

<!-- Force the durations, in ms — nested children, delays, third-party CSS -->
<Transition :duration="550">…</Transition>
<Transition :duration="{ enter: 500, leave: 250 }">…</Transition>
```

- `:duration` is the fix for **nested transitions**: the parent finishes before
  its animated children, and Vue removes the node too early

---

# Custom class names

```vue
<Transition
  enter-from-class="opacity-0 translate-y-2"
  enter-active-class="transition duration-300 ease-out"
  enter-to-class="opacity-100 translate-y-0"
  leave-active-class="transition duration-150 ease-in"
  leave-to-class="opacity-0"
>
  <div v-if="open">…</div>
</Transition>
```

- One prop per class: `enter-from-class`, `enter-active-class`, `enter-to-class`,
  and the three `leave-*` equivalents (plus `appear-*`)
- Mandatory with **utility CSS** (Tailwind, UnoCSS) and with third-party animation
  stylesheets such as Animate.css

```vue
<Transition
  enter-active-class="animate__animated animate__tada"
  leave-active-class="animate__animated animate__bounceOutRight"
>
```

---

# `appear` — animating the first render

```vue
<Transition appear>
  <HeroBanner />
</Transition>
```

- By default, a transition **only** plays on updates, never on the initial render
- `appear` replays the enter sequence when the component mounts
- The `appear-*-class` props and `@before-appear` / `@appear` / `@after-appear`
  hooks let you use a **different** animation for the first paint

<br />

> ⚠️ On an SSR-hydrated page, `appear` animates content the user **already sees**
> in the server HTML. It usually looks like a bug, not like polish.

---

# What triggers a transition

```vue
<!-- 1. v-if / v-else / v-else-if — the node is created and destroyed -->
<Transition><p v-if="ok">Yes</p><p v-else>No</p></Transition>

<!-- 2. v-show — the node stays, only display toggles -->
<Transition><p v-show="ok">Toggled</p></Transition>

<!-- 3. A dynamic component -->
<Transition mode="out-in"><component :is="currentTab" /></Transition>

<!-- 4. A changing key on the same element -->
<Transition><span :key="count">{{ count }}</span></Transition>
```

- Case **4** is the trick for animating a *value* change: a new `key` means a new
  vnode, so Vue leaves the old one and enters the new one

---

# One child, and only one

```vue
<!-- ❌ Two root nodes: Vue warns, nothing is animated -->
<Transition>
  <header v-if="open">…</header>
  <main v-if="open">…</main>
</Transition>

<!-- ✅ One element, containing whatever you like -->
<Transition>
  <div v-if="open"><header>…</header><main>…</main></div>
</Transition>
```

- `<Transition>` animates **one** element or component at a time
- With `v-if` / `v-else` branches there are several children in the template, but
  **only one is rendered** at any moment — that is allowed
- A **component** child works, provided it has a single root element; a fragment
  root gives you the same warning

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

# JavaScript hooks

```vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @enter-cancelled="onEnterCancelled"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
  @leave-cancelled="onLeaveCancelled"
  :css="false"
>
  <div v-if="open" class="panel">…</div>
</Transition>
```

- `@enter` and `@leave` receive `(el: Element, done: () => void)`
- **You must call `done()`**, or the element never finishes entering — and, on
  leave, never leaves the DOM
- `:css="false"` tells Vue to **skip class handling and duration sniffing**
  entirely: your hooks are the single source of truth

---

# Driving an animation library

```ts
import { animate } from 'motion';

const onEnter = (el: Element, done: () => void): void => {
  animate(
    el,
    { opacity: [0, 1], transform: ['translateY(-12px)', 'none'] },
    { duration: 0.3, easing: [0.16, 1, 0.3, 1] },
  ).finished.then(done);
};

const onLeave = (el: Element, done: () => void): void => {
  animate(el, { opacity: 0 }, { duration: 0.15 }).finished.then(done);
};
```

- Same shape with **GSAP** (`gsap.to(el, { …, onComplete: done })`) or the
  **Web Animations API** (`el.animate(…).finished.then(done)`)
- `@enter-cancelled` fires when the user toggles back mid-flight — **kill the
  running tween there**, or two animations fight over the same element
- ⚠️ `@leave-cancelled` only fires with `v-show`: a `v-if` leave cannot be
  interrupted, it restarts as an enter once the node is gone

---

# Making a transition reusable

```vue
<!-- FadeTransition.vue -->
<template>
  <Transition name="fade" v-bind="$attrs">
    <slot />
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
```

```vue
<FadeTransition mode="out-in" appear>
  <component :is="currentTab" />
</FadeTransition>
```

- `v-bind="$attrs"` forwards `mode`, `appear`, `:duration` and the hooks
- ⚠️ The `<style>` block is **not** `scoped`: the classes are applied to the
  *slotted* element, which belongs to the parent component

> Design systems ship a handful of these — `FadeTransition`, `SlideTransition`,
> `CollapseTransition` — instead of repeating six CSS classes per feature.

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

# FLIP — the gotchas

- FLIP animates with `transform` only, so the element must be **transformable**:
  it cannot be `display: inline`. Use `inline-block`, or a flex/grid parent

<br />

- A leaving element is still in the flow while it animates, so the others do not
  move until it is gone. `position: absolute` on `*-leave-active` removes it from
  the flow immediately — that is why the rule above is there, and why the
  container often needs `position: relative`

<br />

- `moveClass="my-move"` overrides the generated `v-move` name, for utility CSS

<br />

> No `key`, no FLIP: Vue reuses the DOM nodes in place and simply patches their
> text. The list changes without a single element ever "moving".

---

# Staggered lists

```vue
<TransitionGroup :css="false" @before-enter="onBeforeEnter" @enter="onEnter" tag="ul">
  <li v-for="(item, index) in items" :key="item.id" :data-index="index">
    {{ item.label }}
  </li>
</TransitionGroup>
```

```ts
const onBeforeEnter = (el: Element): void => {
  (el as HTMLElement).style.opacity = '0';
};

const onEnter = (el: Element, done: () => void): void => {
  const index = Number((el as HTMLElement).dataset.index);
  animate(el, { opacity: 1 }, { delay: index * 0.05 }).finished.then(done);
};
```

- The delay comes from the element's **own index**, read back from the DOM
- Keep the stagger short: `index * 50 ms` on a 40-item list is a 2-second wait

---

# Accessibility — `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .list-move { transition-duration: 0.01ms !important; }
}
```

- Motion triggers **nausea and migraines** for users with vestibular disorders —
  this is a real accessibility requirement, not a preference
- Do **not** set `transition: none`: Vue would never receive `transitionend` and
  the element would stay stuck. Keep a duration close to zero instead

<br />

```ts
// The same signal, from JavaScript hooks
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = reduced ? 0 : 0.3;
```

> Announce the *result* to assistive technology (`aria-live`), not the animation.

---

# Performance — stay on the compositor

- Only two properties animate without touching layout or paint:
  **`transform`** and **`opacity`**

<br />

| Instead of | Animate |
|---|---|
| `height`, `width` | `transform: scaleY()` — or the modern `interpolate-size` |
| `top`, `left` | `transform: translate()` |
| `margin`, `padding` | the container's `transform` |
| `box-shadow` | the `opacity` of a pseudo-element carrying the shadow |

<br />

- `will-change: transform` **only** on elements that are about to animate, and
  removed afterwards — every hint costs a compositor layer
- On a `<TransitionGroup>` of 500 rows, FLIP measures every child on every change:
  paginate or virtualize before animating

---

# Combining with the other built-ins

```vue
<!-- Teleport outside, Transition inside: the modal animates where it lands -->
<Teleport to="body">
  <Transition name="modal">
    <div v-if="open" class="backdrop">…</div>
  </Transition>
</Teleport>

<!-- KeepAlive: Transition must be the outermost of the two -->
<RouterView v-slot="{ Component }">
  <Transition name="fade" mode="out-in">
    <KeepAlive :max="5">
      <component :is="Component" />
    </KeepAlive>
  </Transition>
</RouterView>
```

- With `<Suspense>`, animate the **switch** between the fallback and the resolved
  content by wrapping the `<Suspense>` itself
- Route transitions are covered in **chapter 5**, together with the native
  **View Transitions API** — which morphs elements *across* routes, something
  `<Transition>` cannot do

---

# Testing a transition

```ts
// Chapter 4: by default, @vue/test-utils stubs <Transition>
const wrapper = mount(Alert, {
  global: { stubs: { transition: false } },   // render the real one
});
```

- jsdom implements **no** layout and fires **no** `transitionend`: an animation
  never completes, and a leaving element never disappears
- So: assert on the **classes** Vue applies, or keep the default stub and test
  the *state*, not the animation

<br />

> The animation itself belongs to a **visual** test — a Cypress / Playwright
> screenshot, or a Storybook story — not to a jsdom unit test.

---

# Debugging — the usual suspects

| Symptom | Cause |
|---|---|
| Nothing happens at all | No `transition` / `animation` on `*-active`, or the child has several root nodes |
| Enter works, leave does not | The element is removed by something other than the `<Transition>` child (a parent `v-if`) |
| The element never disappears | `:css="false"` and `done()` is never called — or `transition: none` under `prefers-reduced-motion` |
| The layout jumps | Missing `mode="out-in"`: both elements are in the DOM at once |
| `v-move` does nothing | Missing `key`, or the children are `display: inline` |
| The transition is cut short | Nested children animate longer than the root — set `:duration` |
| It fires on page load | `appear` — often inherited from a shared transition component |

---

# Recap

| Tool | Use it for | Watch out for |
|---|---|---|
| `<Transition>` | One element entering / leaving | Exactly one child, one root |
| `name` | Namespacing the six classes | — |
| `mode="out-in"` | Replacing content | Doubles the total duration |
| `appear` | Animating the first render | Looks wrong after SSR |
| `:duration` | Nested or delayed animations | In milliseconds |
| Custom classes | Tailwind, Animate.css | Six props to wire |
| JS hooks + `:css="false"` | GSAP, Motion, WAAPI | Always call `done()` |
| `<TransitionGroup>` | Lists: insert, remove, reorder | `key` required, no `mode` |
| `v-move` | The FLIP reordering | Not on `display: inline` |
| `prefers-reduced-motion` | Every animation you ship | Near-zero duration, never `none` |

---

# Quiz — Question 1 / 5

**Why does `<Transition>` wait one frame before swapping `enter-from` for
`enter-to`?**

- **A.** To leave the browser time to download the CSS
- **B.** So the browser paints the starting state — otherwise there is nothing to
  interpolate from
- **C.** To synchronise with `requestIdleCallback`
- **D.** To let the `@before-enter` hook run asynchronously

<v-click>

> ✅ **B** — If both classes were applied in the same frame, the browser would only
> ever see the final state and would jump straight to it. That forced reflow
> between the two frames is the whole trick.

</v-click>

---

# Quiz — Question 2 / 5

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

# Quiz — Question 3 / 5

**A `<Transition>` uses `:css="false"` and GSAP. On leave, the element fades out
correctly but stays in the DOM forever. Why?**

- **A.** `:css="false"` is incompatible with `v-if`
- **B.** The `@leave` hook never calls its `done()` callback
- **C.** `mode="out-in"` is missing
- **D.** GSAP animations are not detected by `transitionend`

<v-click>

> ✅ **B** — With `:css="false"`, Vue stops sniffing durations entirely: `done()` is
> the **only** signal that the leave phase is over. `gsap.to(el, { …, onComplete:
> done })`. **D** describes the symptom, not the cause — that detection is
> precisely what `:css="false"` turned off.

</v-click>

---

# Quiz — Question 4 / 5

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

---

# Quiz — Question 5 / 5

**Which `prefers-reduced-motion` implementation is correct?**

- **A.** `transition: none !important` on the `*-active` classes
- **B.** `transition-duration: 0.01ms !important` on the `*-active` classes
- **C.** Remove the `<Transition>` with a `v-if` on the media query
- **D.** Nothing — Vue handles it automatically

<v-click>

> ✅ **B** — With `transition: none`, no `transitionend` event is ever fired: Vue
> waits forever and the leaving element **never leaves the DOM**. A near-zero
> duration is imperceptible *and* still emits the event. Vue does nothing on its
> own (**D**): respecting the preference is entirely on you.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2ter - Transition & TransitionGroup — 45 min

Continue in `tp/02_advanced_components`, on top of the `Teleport` modal and the
row list:

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

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
