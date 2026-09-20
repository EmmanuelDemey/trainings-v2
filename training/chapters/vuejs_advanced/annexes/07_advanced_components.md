---
layout: cover
---

# Annexe — Advanced components

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

---

# How Vite sees your app: the module graph

```ts
import { ref } from 'vue';                    // static: always in the graph
const Editor = () => import('./Editor.vue');  // dynamic: a graph boundary
```

- **In dev**, Vite serves your ESM to the browser and transforms each file **on
  demand**; `node_modules` is pre-bundled once with esbuild
- **On build**, Rollup (Rolldown from Vite 8) follows every `import` from the
  entry and builds the **module graph**: which module pulls in which
- **Tree shaking** drops every export nothing in that graph reaches — it works
  only because ESM `import`s are **static**, analysable without running the code
- A dynamic **`import()` cuts the graph**: everything reachable only from there
  lands in its **own chunk**, fetched separately

> What stays in the static graph is downloaded up front; what sits behind an
> `import()` is not. That is the lever of this chapter — chapter 16 measures it.

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

# Testing an async component

```ts
it('shows the fallback, then the resolved component', async () => {
  const wrapper = mount(ChartPanel);          // <Suspense> + defineAsyncComponent

  expect(wrapper.get('[data-testid="skeleton"]').exists()).toBe(true);

  await flushPromises();                      // let the dynamic import resolve

  expect(wrapper.findComponent(SalesChart).exists()).toBe(true);
});
```

- The loader returns a promise: **one `flushPromises()` per level of `await`**
- To test the error branch, make the loader reject:
  `defineAsyncComponent(() => Promise.reject(new Error('boom')))`
- `v-memo` and `v-once` are invisible to tests — assert on **render counts**, not
  on the directive

> `mount`, `flushPromises` and the stubbing trade-off are chapter 3's material —
> this slide is only what changes when the component resolves asynchronously.

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
> `attachTo` and query `document`, or stub it (see chapter 3).

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
  every VNode is `BAIL`, every child is diffed

<br />

> Before optimizing, **measure**: the Vue Devtools **Timeline** tells you *what*
> re-rendered, `app.config.performance = true` tells you *how long* it took (see the
> Devtools sequence). Most perf problems are unnecessary re-renders of big lists.

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

# Quiz — Question 1 / 2

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

# Quiz — Question 2 / 2

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

