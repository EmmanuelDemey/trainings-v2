---
layout: cover
---

# 7 - Advanced components

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Defer** a heavy component with `defineAsyncComponent`, with its loading, error
  and retry states
- **Coordinate** several async children under a single `Suspense` fallback, and
  **handle** the rejection it does not catch for you
- **Design** a component API with named slots and their fallback content
- **Hand** data back to the parent with **scoped slots** — the child owns the
  logic, the parent owns the markup
- **Move** a modal out of its stacking context with `Teleport`, without changing
  props, events or lifecycle
- **Decide** when `v-once` and `v-memo` are worth it, and **apply** `v-memo`'s
  rules without shipping stale UI

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
  `onErrorCaptured` in a parent, or an error boundary component (chapter 13)

```ts
onErrorCaptured((err) => { error.value = err; return false; });
```

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

# Recap

| Tool | Use it for | Watch out for |
|---|---|---|
| `defineAsyncComponent` | Deferring rarely-used code | `onError` must choose: `retry()` or `fail()` |
| `Suspense` | One fallback for a subtree | Still experimental |
| Named slots | Layout composition | Fallback content lives inside the `<slot>` |
| Scoped slots | Logic in the child, markup in the parent | The parent only sees the props you expose |
| `Teleport` | Modals, toasts, tooltips | Only the DOM moves — props, events, hooks don't |
| `v-once` | Truly immutable subtrees | Silently stale if it changes |
| `v-memo` | Huge `v-for` lists | Must list *every* dependency |

---

# Quiz — Question 1 / 3

**When is the chunk of a `defineAsyncComponent` actually downloaded?**

- **A.** The first time the component is rendered
- **B.** When the module declaring it is imported
- **C.** During `createApp()`, with the rest of the entry chunk
- **D.** As soon as the browser goes idle

<v-click>

> ✅ **A** — The loader is called on the first render, not on import. Declaring an
> async component at the top of a file costs nothing until something renders it.

</v-click>

---

# Quiz — Question 2 / 3

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

# Quiz — Question 3 / 3

**Which `v-memo` usage is correct?**

- **A.** On a child element of the element carrying `v-for`
- **B.** `v-memo="[]"` on a subtree that changes on every render
- **C.** With a dependency array whose length varies between renders
- **D.** On the same element as `v-for`, listing every reactive value the subtree reads

<v-click>

> ✅ **D** — `v-memo` must sit on the `v-for` element, its array must have a
> **constant length**, and forgetting one dependency ships silently stale UI.
> `v-memo="[]"` is just `v-once`, so **C** would freeze a changing subtree.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 7 - Advanced components
