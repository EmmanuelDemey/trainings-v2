---
layout: cover
---

# 1 - Vue fundamentals recap

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** between `ref`, `reactive` and `shallowRef` for a given piece of state
- **Write** a watcher with the right source, timing (`flush`) and cleanup
- **Express** a component contract with `props`, `emits` and `defineModel`
- **Share** data with `provide` / `inject` and reach the DOM with template refs
- **Diagnose** the classic reactivity traps — destructured `reactive`, reassignment,
  missing `.value`
- **Identify** what **Vue 3.5** changed, and check that a project actually runs it

---

# Where we start from

This chapter is a **fast recap**, not a re-teaching. It fixes the vocabulary used
for the next three days, and lingers only on what still bites experienced
developers.

- Reactivity primitives, and the traps around them
- Watchers: sources, timing, cleanup
- The component contract: `props`, `emits`, `defineModel`
- The escape hatches: `provide` / `inject`, template refs
- What **Vue 3.5** changed

> If a slide here surprises you, say so now — everything that follows builds on it.

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
| Needs `.value` | ✅ (script only — auto-unwrapped in the template) | ❌ |
| Survives destructuring | ✅ | ❌ (loses reactivity) |
| Can be reassigned | ✅ | ❌ |

> Rule of thumb: **default to `ref`**. Reach for `reactive` only for an object
> you never reassign, and `shallowRef` for large lists you always replace whole.

---

# Watchers: sources, timing, cleanup

```ts
watch(userId, async (id, previousId) => { /* explicit source, lazy */ },
      { immediate: true });

watchEffect(() => { /* implicit sources, runs immediately, re-tracks */ });
```

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
- Both stop automatically when the owning component unmounts

---

# The component contract

```vue
<script setup lang="ts">
interface Props { label: string; disabled?: boolean }

const { label, disabled = false } = defineProps<Props>();

const emit = defineEmits<{ submit: [value: string]; cancel: [] }>();

const model = defineModel<string>({ required: true });
const count = defineModel<number>('count', { default: 0 });
</script>
```

```vue
<SearchInput v-model="query" v-model:count="resultCount" />
```

- Type-only `defineProps` / `defineEmits` — no runtime declaration duplicated
- Since **Vue 3.5**, destructured props stay **reactive** (Reactive Props Destructure)
- Props are **read-only**: never mutate them, emit an event instead
- `defineModel` (stable since 3.4) replaces the `props` + `emit('update:modelValue')`
  boilerplate

---

# Lifecycle and teardown

```ts
import { onMounted, onUnmounted, onErrorCaptured } from 'vue';

onMounted(() => observer.observe(el.value!));

onUnmounted(() => observer.disconnect());   // always undo what you did on mount

onErrorCaptured((err, instance, info) => {
  report(err, info);
  return false;               // stop the error from propagating further up
});
```

- Hooks must be called **synchronously** during `setup` — never inside a callback
  or after an `await`
- Every subscription created on mount needs a matching teardown; this is the
  contract composables have to honour too (chapter 3)

---

# The escape hatches

```ts
// Typed injection key — shared between provider and consumers
export interface Theme { mode: Ref<'light' | 'dark'>; toggle: () => void }
export const themeKey: InjectionKey<Theme> = Symbol('theme');

provide(themeKey, { mode, toggle });              // ancestor
const theme = inject(themeKey, defaultTheme);     // any descendant → Theme
```

```vue
<script setup lang="ts">
const input = useTemplateRef<HTMLInputElement>('search');
onMounted(() => input.value?.focus());
</script>

<template><input ref="search" /></template>
```

- `provide` / `inject` for **cross-cutting concerns** (theme, i18n, config), not
  for app state — that's Pinia's job (chapter 6)
- `useTemplateRef()` (3.5+) decouples the variable name from the `ref` attribute;
  a child ref exposes only what it declares with `defineExpose()`

---

# Reactivity traps

```ts
const state = reactive({ count: 0 });
const { count } = state;         // ❌ plain number, reactivity lost
const { count } = toRefs(state); // ✅ Ref<number>

const list = ref<Item[]>([]);
list.value.push(item);           // ✅ tracked
list = [...];                    // ❌ compile error — assign to .value
```

```ts
count.value = 1; count.value = 2; count.value = 3;
// one single re-render, with count === 3
await nextTick();
console.log(el.textContent);     // '3' — the DOM is now up to date
```

- `reactive` cannot wrap primitives, and **destructuring breaks it**
- Mutations in the same tick are **coalesced** into one render — which is why
  tests must `await nextTick()` (or `flushPromises()`) before asserting (chapter 4)

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

# Quiz — Question 1 / 4

**What does `const { count } = reactive({ count: 0 })` give you?**

- **A.** A `Ref<number>` you read with `.value`
- **B.** A plain `number`, disconnected from the reactive object
- **C.** A `computed` recalculated on every access
- **D.** A compile error — a `reactive` object cannot be destructured

<v-click>

> ✅ **B** — `reactive` returns a Proxy: destructuring **reads** the property once
> and you keep a copy of the value. Use `toRefs(state)` to keep refs, or default to
> `ref` in the first place.

</v-click>

---

# Quiz — Question 2 / 4

**A watcher needs to read the DOM the component has just re-rendered. Which option?**

- **A.** `{ immediate: true }`
- **B.** `{ deep: true }`
- **C.** `{ flush: 'post' }`
- **D.** `{ flush: 'sync' }`

<v-click>

> ✅ **C** — The default `flush: 'pre'` runs the callback **before** the re-render.
> `'post'` runs it after the DOM update; `'sync'` runs it on every mutation, which
> you rarely want.

</v-click>

---

# Quiz — Question 3 / 4

**Since Vue 3.5, what happens to `const { label } = defineProps<Props>()`?**

- **A.** It throws at runtime
- **B.** It works, but `label` is frozen after the first render
- **C.** `label` stays reactive — Reactive Props Destructure is stable
- **D.** It still requires `toRefs(props)` to stay reactive

<v-click>

> ✅ **C** — The compiler rewrites every read of `label` into `props.label`.
> This is one of the few places where destructuring does **not** break reactivity.

</v-click>

---

# Quiz — Question 4 / 4

```ts
count.value = 1;
count.value = 2;
count.value = 3;
```

**How many re-renders, and when is the DOM up to date?**

- **A.** Three re-renders, the DOM updates after each assignment
- **B.** One re-render with `count === 3`, DOM up to date after `await nextTick()`
- **C.** One re-render with `count === 1`
- **D.** No re-render until a `flush: 'sync'` watcher forces one

<v-click>

> ✅ **B** — Mutations in the same tick are **coalesced** into a single render.
> This is exactly why component tests must `await nextTick()` (or `flushPromises()`)
> before asserting on the DOM.

</v-click>

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
