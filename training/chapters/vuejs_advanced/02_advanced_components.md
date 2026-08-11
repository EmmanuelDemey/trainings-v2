---
layout: cover
---

# 2 - Advanced components

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
  `onErrorCaptured` in a parent, or an error boundary component

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

# Rendering cost: what actually happens

- On every re-render, Vue builds a new **virtual DOM tree** for the component and
  diffs it against the previous one
- The compiler already helps a lot:
  - **static hoisting** — static nodes are created once
  - **patch flags** — only dynamic bindings are compared
  - **tree flattening** — static subtrees are skipped during diff

<br />

> Before optimizing, **measure** with the Vue Devtools "Performance" tab or
> `performance.mark`. Most perf problems are unnecessary re-renders of big lists.

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
| `v-once` | Truly immutable subtrees | Silently stale if it changes |
| `v-memo` | Huge `v-for` lists | Must list *every* dependency |

---
layout: cover
---

# Hands-on

## Workshop 2 - Advanced components
- Turn a heavy chart panel into an **async component** with a skeleton, a delay,
  an error component and a retry strategy
- Wrap an `await`-ing profile component in **`Suspense`** and handle its rejection
- Build a `DataTable` exposing a **scoped slot** per column, typed with `defineSlots`
- Measure a 5 000-row list, then optimize it with `shallowRef`, a stable `key`
  and finally `v-memo` — comparing the numbers at each step

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
