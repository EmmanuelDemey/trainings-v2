---
layout: cover
---

# 2 - Advanced components

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Defer** a heavy component with `defineAsyncComponent`, with its loading, error
  and retry states
- **Coordinate** several async children under a single `Suspense` fallback, and
  handle its errors
- **Design** a component API with named and scoped slots, typed with `defineSlots`
- **Extract** reusable logic into a renderless component when the markup varies
- **Move** a modal out of its stacking context with `Teleport`, including the
  `defer` prop when the target is rendered by the app itself
- **Decide** when `v-once` and `v-memo` are worth it, and **measure** the gain
  before and after

---

# Why async components?

- A Vue application is shipped as **one JavaScript bundle** by default
- Everything the user *might* need is downloaded before anything is displayed
- Async components let the bundler **split the code** and load a component
  **only when it is rendered**

<br />

Typical candidates:

| Component | Why defer it |
|---|---|
| Admin dashboard | Only 2% of users have the role |
| Rich text editor | 300 kB of dependencies |
| Chart library | Below the fold, needed after a click |
| Modal / drawer content | Rendered only when opened |

---

# `defineAsyncComponent`

```ts
import { defineAsyncComponent } from 'vue';

const RichEditor = defineAsyncComponent(
  () => import('./RichEditor.vue')
);
```

- The loader is a function returning a **Promise** — `import()` is the natural fit
- Vite / Rollup see the dynamic `import()` and emit a **separate chunk**
- The component behaves exactly like a normal one in the template

```vue
<template>
  <RichEditor v-if="editing" v-model="content" />
</template>
```

> The chunk is fetched the first time the component is **rendered**, not imported.

---

# Loading and error states

```ts
const RichEditor = defineAsyncComponent({
  loader: () => import('./RichEditor.vue'),

  loadingComponent: EditorSkeleton,
  delay: 200,               // wait 200ms before showing the loader

  errorComponent: EditorError,
  timeout: 10_000,          // after 10s, render errorComponent

  onError(error, retry, fail, attempts) {
    if (attempts <= 3 && error.message.includes('fetch')) {
      retry();              // network hiccup: try again
    } else {
      fail();
    }
  },
});
```

- `delay` avoids a **flash of spinner** on fast connections
- `errorComponent` receives an `error` prop — display it, don't swallow it

---

# Async components and network failures

- A dynamic `import()` **fails** when the chunk 404s — a classic symptom of a
  **new deployment** while an old tab is still open

```ts
onError(error, retry, fail, attempts) {
  const isChunkError = /Loading chunk|Failed to fetch dynamically imported/
    .test(error.message);

  if (isChunkError && attempts === 1) {
    return retry();                 // transient network error
  }
  if (isChunkError) {
    return window.location.reload(); // stale index.html: get the new manifest
  }
  fail();
}
```

- Alternative: listen to Vite's `vite:preloadError` event on `window`
- Keep old chunks around for a while on your CDN when you can

---

# `Suspense` — one loading state for a whole subtree

```vue
<template>
  <Suspense>
    <template #default>
      <UserProfile :id="id" />       <!-- may await inside setup -->
    </template>
    <template #fallback>
      <ProfileSkeleton />
    </template>
  </Suspense>
</template>
```

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
const user = await fetchUser(props.id);   // top-level await
</script>
```

- `Suspense` waits for **every async dependency** in the subtree
- One fallback instead of N spinners
- ⚠️ Still marked **experimental** — the API may change

---

# `Suspense` events and errors

```vue
<Suspense @pending="loading = true" @resolve="loading = false" @fallback="...">
  <RouterView />
</Suspense>
```

- `pending` — a new async branch started
- `resolve` — the default slot is ready
- `fallback` — the fallback content is being shown

<br />

- A rejected top-level `await` **does not** trigger the fallback: catch it with
  `onErrorCaptured` in a parent, or an error boundary component (chapter 8bis)

```ts
onErrorCaptured((err) => { error.value = err; return false; });
```

---

# Lazy hydration (Vue 3.5)

- For SSR apps: the markup is delivered by the server, but the JS still has to
  **hydrate** every component
- Vue 3.5 lets you decide **when** an async component hydrates

```ts
import {
  defineAsyncComponent,
  hydrateOnVisible,
  hydrateOnIdle,
  hydrateOnInteraction,
  hydrateOnMediaQuery,
} from 'vue';

const Comments = defineAsyncComponent({
  loader: () => import('./Comments.vue'),
  hydrate: hydrateOnVisible(),               // when scrolled into view
});

const Chat = defineAsyncComponent({
  loader: () => import('./Chat.vue'),
  hydrate: hydrateOnInteraction(['click', 'focus']),
});
```

- Directly reduces **Total Blocking Time** on content-heavy pages

---

# Slots — the recap

```vue
<!-- Card.vue -->
<template>
  <section class="card">
    <header><slot name="header">Default title</slot></header>
    <slot />                                  <!-- the default slot -->
    <footer><slot name="footer" /></footer>
  </section>
</template>
```

```vue
<Card>
  <template #header><h2>Invoices</h2></template>
  Content goes in the default slot.
  <template #footer><button>Close</button></template>
</Card>
```

- Slot content is compiled in the **parent's** scope — it sees the parent's data
- A `<slot>` with children renders them as **fallback content**

---

# Scoped slots — passing data upward

```vue
<!-- DataList.vue -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      <slot name="row" :item="item" :index="index" :selected="isSelected(item)" />
    </li>
  </ul>
</template>
```

```vue
<DataList :items="users">
  <template #row="{ item, index, selected }">
    <strong :class="{ selected }">{{ index + 1 }}. {{ item.name }}</strong>
  </template>
</DataList>
```

- The child owns the **logic and iteration**, the parent owns the **markup**
- This is the foundation of every headless UI library

---

# Typing slots with TypeScript

```vue
<script setup lang="ts" generic="T extends { id: number }">
defineProps<{ items: T[] }>();

defineSlots<{
  row(props: { item: T; index: number; selected: boolean }): unknown;
  empty?(): unknown;
}>();
</script>
```

- `defineSlots` gives **autocompletion and type errors** in the consuming component
- Combined with `generic="T"`, the item type flows from the parent's array

---

# Dynamic and conditional slots

```vue
<!-- Render only the sections the parent actually filled -->
<template>
  <header v-if="$slots.header"><slot name="header" /></header>

  <!-- Slot name computed at runtime -->
  <slot :name="currentStep" :data="stepData" />
</template>
```

```ts
// $slots is available in the script too
import { useSlots } from 'vue';
const slots = useSlots();
const hasFooter = computed(() => Boolean(slots.footer));
```

- `$slots.name` is a **function** (or `undefined`) — checking it avoids empty wrappers
- ⚠️ `$slots.x` truthiness does not tell you the slot renders *something*: a slot
  returning only comments still exists

---

# Renderless components

```vue
<!-- MousePosition.vue — no markup at all, only behaviour -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const x = ref(0), y = ref(0);
const update = (e: MouseEvent): void => { x.value = e.pageX; y.value = e.pageY; };

onMounted(() => window.addEventListener('mousemove', update));
onUnmounted(() => window.removeEventListener('mousemove', update));
</script>

<template><slot :x="x" :y="y" /></template>
```

```vue
<MousePosition v-slot="{ x, y }">{{ x }}, {{ y }}</MousePosition>
```

> In Vue 3, a **composable** is usually the better tool for pure logic reuse.
> Keep renderless components when you also need slots, lifecycle *and* templating.

---

# `Teleport` — render here, mount elsewhere

- A modal is **logically** a child of the component that opens it…
- …but an ancestor with `overflow: hidden`, a `transform` or a competing
  `z-index` traps it visually — the classic "my dialog is clipped" bug

```vue
<template>
  <button type="button" @click="open = true">Delete</button>

  <Teleport to="body">
    <div v-if="open" class="backdrop" @click.self="open = false">
      <div class="modal" role="dialog" aria-modal="true">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
```

- Only the **DOM nodes** move: props, `provide` / `inject`, emitted events and
  lifecycle hooks all behave as if the node had stayed in place

---

# `Teleport` — `disabled` and `defer`

```vue
<!-- Fullscreen on mobile, inline in the panel on desktop -->
<Teleport to="body" :disabled="isDesktop"> ... </Teleport>

<!-- The target is rendered by the app itself, later in the same tick -->
<Teleport defer to="#modal-root"> ... </Teleport>
<div id="modal-root" />
```

- `to` takes a **selector or an element**, resolved when the teleport *mounts* —
  a missing target logs a warning and renders nothing
- `defer` (Vue **3.5**) resolves `to` **after** the current render tick, which is
  the only way to target a container rendered by the same app
- Toggling `:disabled` moves the nodes back and forth and **preserves state**
- Several teleports to the same target are **appended** in mount order

> In unit tests, `Teleport` escapes the wrapper's DOM: either mount with
> `attachTo` and query `document`, or stub it (see chapter 4).

---

# Rendering cost: what actually happens

```
      a reactive dependency changed
                  │
                  ▼
   ┌───────────────────────────────┐
   │  render()                     │  ① rebuild a VNode tree
   └───────────────────────────────┘     plain JS objects
                  │  new tree
                  ▼
   ┌───────────────────────────────┐
   │  patch — diff vs previous     │  ② compare, node by node
   └───────────────────────────────┘     ⬅ the compiler shrinks *this*
                  │  minimal set of changes
                  ▼
   ┌───────────────────────────────┐
   │  DOM operations               │  ③ the expensive part
   └───────────────────────────────┘     (layout, paint)
```

- ③ is what the user pays for — the whole game is to reach it with as few
  operations as possible
- The compiler already helps a lot, for free: **static hoisting**,
  **patch flags**, **tree flattening**

---

# Patch flags — the compiler marks what can change

```vue
<div class="card">
  <h2 class="title">Invoice</h2>
  <p>Reference: {{ invoice.ref }}</p>
  <span :class="statusClass">{{ invoice.status }}</span>
</div>
```

```js
const _hoisted_1 = { class: "card" }

export function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _cache[0] || (_cache[0] = _createElementVNode(
      "h2", { class: "title" }, "Invoice", -1 /* CACHED */)),          // ⬅ hoisted
    _createElementVNode("p", null,
      "Reference: " + _toDisplayString(_ctx.invoice.ref), 1 /* TEXT */),
    _createElementVNode("span", { class: _normalizeClass(_ctx.statusClass) },
      _toDisplayString(_ctx.invoice.status), 3 /* TEXT, CLASS */)
  ]))
}
```

- The trailing number is the **patch flag**: a bitmask of *what may differ* on
  the next render — everything else is never even compared

---

# Patch flags — the vocabulary

| Flag | Value | The diff will only look at |
|---|---|---|
| `TEXT` | 1 | the text child |
| `CLASS` | 2 | the `class` binding |
| `STYLE` | 4 | the `style` binding |
| `PROPS` | 8 | the props listed in `dynamicProps` |
| `FULL_PROPS` | 16 | everything — the prop **keys** are dynamic |
| `STABLE_FRAGMENT` | 64 | nothing structural — the children order cannot change |
| `KEYED_FRAGMENT` | 128 | keyed children — run the keyed reconciliation |
| `CACHED` | -1 | nothing: hoisted node, reused as-is |
| `BAIL` | -2 | everything: **optimized mode is off** for that subtree |

- Flags combine with `|` — `3` above is `TEXT | CLASS`
- `BAIL` is what you get on VNodes the compiler did not produce: `h()`, JSX,
  `v-html` content, third-party render functions

---

# Tree flattening — the diff walks a flat array

```
   the VNode tree                        what patch() really visits
   ──────────────                        ──────────────────────────

   div.card  ← BLOCK ────────────────▶  block.dynamicChildren = [
   ├── h2.title      CACHED                 <p>     1 /* TEXT */,
   ├── p             1 /* TEXT */           <span>  3 /* TEXT, CLASS */
   └── span          3 /* TEXT, CLASS */    ]

   4 nodes to walk, at any depth         2 entries, no tree walk at all
```

- A **block** (`_openBlock()` / `_createElementBlock()`) collects its dynamic
  descendants in **one flat array**, whatever their nesting depth
- On update the renderer iterates that array — static subtrees are never entered,
  so the diff cost follows the number of **bindings**, not the size of the template
- `v-if`, `v-for` and dynamic slots open **new blocks**: their structure can
  change, so they are diffed as a unit

---

# What this means in practice

- You almost never need `v-once` / `v-memo`: the compiler already skips the static
  parts of a template
- What it cannot skip is a **component re-rendering for nothing** — that is a
  reactivity problem (a prop that changes identity, a store getter recomputed),
  not a diff problem
- Writing `render()` or JSX by hand costs you the three optimizations at once —
  every VNode is `BAIL`, every child is diffed (see chapter 2bis)

<br />

> Before optimizing, **measure**: the Vue Devtools **Timeline** tells you *what*
> re-rendered, `app.config.performance = true` tells you *how long* it took (see the
> Devtools sequence). Most perf problems are unnecessary re-renders of big lists.

---

# `v-once` — render once, never again

```vue
<template>
  <!-- Rendered on first render, then treated as static forever -->
  <header v-once>
    <h1>{{ appName }}</h1>
    <span>Build {{ buildId }}</span>
  </header>
</template>
```

- The subtree is created once and **cached** — later updates are ignored
- Perfect for values that are **constant for the component's lifetime**
- ⚠️ If the value *can* change, the UI silently goes stale — a classic bug

---

# `v-memo` — conditional memoization

```vue
<template>
  <div
    v-for="item in list"
    :key="item.id"
    v-memo="[item.id === selectedId, item.updatedAt]"
  >
    <ExpensiveRow :item="item" />
  </div>
</template>
```

- The subtree re-renders **only if one value in the array changed**
- `v-memo="[]"` is equivalent to `v-once`
- Reserved for **large `v-for` lists** (1000+ rows) — this is a micro-optimization

---

# `v-memo` — the rules

```vue
<!-- ❌ v-memo must be on the same element as v-for -->
<div v-for="item in list" :key="item.id">
  <div v-memo="[item.id]">...</div>
</div>

<!-- ✅ -->
<div v-for="item in list" :key="item.id" v-memo="[item.selected]">...</div>
```

- The dependency array must have a **constant length** across renders
- **Every** reactive value used in the subtree must be listed, or you ship stale UI
- Get it wrong and you introduce a bug that's very hard to reproduce

> Reach for `v-memo` **last**: after `key`, after virtual scrolling, after
> `shallowRef`, after splitting the component.

---

# The cheaper optimizations, first

```ts
// 1. Don't make big immutable data deeply reactive
const rows = shallowRef<Row[]>(await fetchRows());

// 2. Freeze data you never mutate
const options = Object.freeze(bigStaticList);

// 3. Give v-for a stable, unique key — never the index
```

```vue
<!-- 4. Virtualize long lists instead of rendering 10 000 nodes -->
<RecycleScroller :items="rows" :item-size="42" v-slot="{ item }">
  <Row :item="item" />
</RecycleScroller>
```

- `shallowRef` + `triggerRef()` when you do need to signal a mutation
- Split a heavy component: a re-render only walks the component that changed

---

# Recap

| Tool | Use it for | Watch out for |
|---|---|---|
| `defineAsyncComponent` | Deferring rarely-used code | Handle `onError` for stale chunks |
| `Suspense` | One fallback for a subtree | Still experimental |
| Named slots | Layout composition | — |
| Scoped slots | Logic in the child, markup in the parent | Type them with `defineSlots` |
| `Teleport` | Modals, toasts, tooltips | Target must exist — or use `defer` |
| `v-once` | Truly immutable subtrees | Silently stale if it changes |
| `v-memo` | Huge `v-for` lists | Must list *every* dependency |

---

# Quiz — Question 1 / 5

**When is the chunk of a `defineAsyncComponent` actually downloaded?**

- **A.** When the module declaring it is imported
- **B.** During `createApp()`, with the rest of the entry chunk
- **C.** The first time the component is rendered
- **D.** As soon as the browser goes idle

<v-click>

> ✅ **C** — The loader is called on the first render, not on import. Declaring an
> async component at the top of a file costs nothing until something renders it.

</v-click>

---

# Quiz — Question 2 / 5

**What is the `delay` option of `defineAsyncComponent` for?**

- **A.** Delaying the dynamic `import()` to protect the critical path
- **B.** Waiting before showing `loadingComponent`, to avoid a flash of spinner
- **C.** Delaying the moment `timeout` starts counting
- **D.** Throttling the retries triggered from `onError`

<v-click>

> ✅ **B** — On a fast connection the chunk arrives in 30 ms; showing a skeleton for
> 30 ms looks worse than showing nothing. `delay: 200` is the usual value.

</v-click>

---

# Quiz — Question 3 / 5

**A top-level `await` inside a component wrapped in `<Suspense>` rejects. What happens?**

- **A.** The `#fallback` slot stays displayed forever
- **B.** `Suspense` renders its `errorComponent`
- **C.** The error propagates — catch it with `onErrorCaptured` in a parent
- **D.** The last successfully rendered subtree is kept

<v-click>

> ✅ **C** — `Suspense` has **no error slot**: the fallback is a *loading* state, not
> an error state. Wrap it in an error boundary, or handle the rejection inside the
> component.

</v-click>

---

# Quiz — Question 4 / 5

**Which `v-memo` usage is correct?**

- **A.** On a child element of the element carrying `v-for`
- **B.** On the same element as `v-for`, listing every reactive value the subtree reads
- **C.** `v-memo="[]"` on a subtree that changes on every render
- **D.** With a dependency array whose length varies between renders

<v-click>

> ✅ **B** — `v-memo` must sit on the `v-for` element, its array must have a
> **constant length**, and forgetting one dependency ships silently stale UI.
> `v-memo="[]"` is just `v-once`, so **C** would freeze a changing subtree.

</v-click>

---

# Quiz — Question 5 / 5

**`<Teleport to="#modal-root">` targets a `<div id="modal-root">` rendered by the
app itself. Vue warns that the target cannot be found. Why, and what fixes it?**

- **A.** The target is resolved on mount, before the app rendered it — add `defer`
- **B.** `to` only accepts `body` — use `to="body"`
- **C.** The teleported component must be async — wrap it in `Suspense`
- **D.** The target must carry a `ref` — pass the element instead of a selector

<v-click>

> ✅ **A** — `to` is resolved when the teleport mounts, and a container rendered
> later in the *same* tick does not exist yet. `defer` (Vue 3.5) postpones the
> lookup to after the render. Passing the element (**D**) has the same problem:
> the `ref` is still `null` at that point.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2 - Advanced components
- Turn a heavy chart panel into an **async component** with a skeleton, a delay,
  an error component and a retry strategy
- Wrap an `await`-ing profile component in **`Suspense`** and handle its rejection
- Build a `DataTable` exposing a **scoped slot** per column, typed with `defineSlots`
- Free a modal from a clipping ancestor with **`Teleport`**, then target a
  container rendered by the app thanks to `defer`
- Measure a 5 000-row list, then optimize it with `shallowRef`, a stable `key`
  and finally `v-memo` — comparing the numbers at each step

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
