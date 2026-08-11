---
layout: cover
---

# 1 - Vue fundamentals recap

---

# Where we start from

This chapter is a **fast recap**, not a re-teaching. It fixes the vocabulary used
for the next three days.

- Single-File Components and `<script setup>`
- The reactivity primitives: `ref`, `reactive`, `computed`, `watch`
- The component contract: `props`, `emits`, `v-model`
- Lifecycle and `provide` / `inject`
- The reactivity traps that bite in real applications

> If a slide in this chapter surprises you, say so now — everything that follows
> builds on it.

---

# Single-File Component with `script setup`

```vue
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
const increment = (): void => { count.value += 1; };
</script>

<template>
  <button type="button" @click="increment">{{ count }}</button>
</template>

<style scoped>
button { padding: 0.5rem 1rem; }
</style>
```

- `<script setup>` is **compiled**: every top-level binding is exposed to the template
- No `return` statement, no `setup()` boilerplate
- `.value` is needed in the script, **auto-unwrapped** in the template

---

# The reactivity primitives

```ts
import { ref, reactive, computed, shallowRef } from 'vue';

const count = ref(0);                    // any value, wrapped in .value
const user = reactive({ name: 'Ada' });  // deep Proxy over an object
const double = computed(() => count.value * 2);       // cached, read-only
const rows = shallowRef<Row[]>([]);      // reactive on reassign only
```

| | `ref` | `reactive` |
|---|---|---|
| Accepts primitives | ✅ | ❌ |
| Needs `.value` | ✅ (script only) | ❌ |
| Survives destructuring | ✅ | ❌ (loses reactivity) |
| Can be reassigned | ✅ | ❌ |

> Rule of thumb: **default to `ref`**. Reach for `reactive` only for an object
> you never reassign.

---

# `watch` vs `watchEffect`

```ts
import { watch, watchEffect } from 'vue';

// Explicit source — you control what triggers it
watch(userId, async (id, previousId) => {
  user.value = await fetchUser(id);
}, { immediate: true });

// Implicit sources — every reactive read inside is tracked
watchEffect(() => {
  console.log(`${query.value} on page ${page.value}`);
});
```

- `watch` is **lazy** by default, gives you the previous value
- `watchEffect` runs **immediately** and re-tracks its dependencies on every run
- Both stop automatically when the owning component unmounts

---

# Watcher timing and cleanup

```ts
watch(source, callback, { flush: 'post' });  // after the DOM update
watch(source, callback, { flush: 'sync' });  // synchronously — use sparingly

watch(id, async (newId, oldId, onCleanup) => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());       // cancels the stale request
  data.value = await fetch(`/api/${newId}`, { signal: controller.signal });
});
```

- Default `flush: 'pre'` — runs **before** the component re-renders
- `onCleanup` is the idiomatic way to cancel in-flight work when the source changes
- Since Vue 3.5, `onWatcherCleanup()` can be imported and called directly

---

# The component contract: props and emits

```vue
<script setup lang="ts">
interface Props {
  label: string;
  disabled?: boolean;
}

const { label, disabled = false } = defineProps<Props>();

const emit = defineEmits<{
  submit: [value: string];
  cancel: [];
}>();
</script>
```

- Type-only `defineProps` / `defineEmits` — no runtime declaration duplicated
- Since **Vue 3.5**, destructured props stay **reactive** (Reactive Props Destructure)
- Props are **read-only**: never mutate them, emit an event instead

---

# `defineModel` — two-way binding, made simple

```vue
<!-- SearchInput.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true });
const count = defineModel<number>('count', { default: 0 });
</script>

<template>
  <input v-model="model" />
</template>
```

```vue
<!-- Parent -->
<SearchInput v-model="query" v-model:count="resultCount" />
```

- Replaces the `props` + `emit('update:modelValue')` boilerplate
- Stable since Vue 3.4 — the recommended way to build form components

---

# Lifecycle hooks

```ts
import { onMounted, onUpdated, onUnmounted, onErrorCaptured } from 'vue';

onMounted(() => {
  observer.observe(el.value!);
});

onUnmounted(() => {
  observer.disconnect();      // always undo what you did on mount
});

onErrorCaptured((err, instance, info) => {
  report(err, info);
  return false;               // stop the error from propagating further up
});
```

- Hooks must be called **synchronously** during `setup` — never inside a callback
- Every subscription created on mount needs a matching teardown

---

# `provide` / `inject`

```ts
// Typed injection key — shared between provider and consumers
import type { InjectionKey, Ref } from 'vue';

export interface Theme { mode: Ref<'light' | 'dark'>; toggle: () => void }
export const themeKey: InjectionKey<Theme> = Symbol('theme');
```

```ts
// Ancestor
provide(themeKey, { mode, toggle });

// Any descendant, at any depth
const theme = inject(themeKey);                  // Theme | undefined
const theme = inject(themeKey, defaultTheme);    // Theme
```

- Avoids "props drilling" through intermediate components
- Use it for **cross-cutting concerns** (theme, i18n, config), not for app state — that's Pinia's job

---

# Template refs

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue';

const input = useTemplateRef<HTMLInputElement>('search');

onMounted(() => input.value?.focus());
</script>

<template>
  <input ref="search" />
</template>
```

- `useTemplateRef()` (Vue 3.5+) decouples the variable name from the `ref` attribute
- A child component's ref exposes only what it declares with `defineExpose()`

---

# Reactivity traps

```ts
const state = reactive({ count: 0 });
const { count } = state;        // ❌ plain number, reactivity lost
const { count } = toRefs(state); // ✅ Ref<number>

const list = ref<Item[]>([]);
list.value.push(item);          // ✅ tracked
list = [...];                   // ❌ compile error — assign to .value
```

- `reactive` cannot wrap primitives, and **destructuring breaks it**
- Replacing a `reactive` object entirely loses the proxy — use `ref` instead
- Vue's reactivity is **synchronous in tracking, asynchronous in rendering**:
  await `nextTick()` before reading the DOM

---

# Rendering is batched

```ts
import { nextTick } from 'vue';

count.value = 1;
count.value = 2;
count.value = 3;
// one single re-render, with count === 3

await nextTick();
console.log(el.textContent);  // '3' — the DOM is now up to date
```

- Multiple mutations in the same tick are **coalesced** into one render
- This is why tests must `await nextTick()` (or `await flushPromises()`) before asserting

---

# Vue 3.5 — what changed

- **Reactive Props Destructure** is stable: `const { label } = defineProps<Props>()`
- **`useTemplateRef()`** and **`useId()`** for SSR-safe unique ids
- **`onWatcherCleanup()`** importable outside the watcher callback
- **Lazy hydration** for async components (see chapter 2)
- Significantly **lower memory usage** on large reactive arrays
- **`useHost()`** / custom element improvements

> Check your project actually runs 3.5+: `npm ls vue`.

---
layout: cover
---

# Hands-on

## Workshop 1 - Warm-up
- Read the starter project of workshop 2 and identify: the props contract, the
  reactive state and the watchers
- Convert one `props` + `emit('update:modelValue')` pair to `defineModel`
- Spot the reactivity bug: a `reactive` object destructured in a composable

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
