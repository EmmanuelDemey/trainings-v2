---
layout: cover
---

# 1 - Vue fundamentals recap

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Diagnose** a piece of state that stopped being reactive — destructured
  `reactive`, `shallowRef`, missing `.value`
- **Recognise** the two watcher bugs that reach production: the stale async
  response and the DOM read one render too early
- **Fix** a broken component contract with `defineModel` instead of mutating a prop
- **Explain** why a lifecycle hook or an `inject()` placed after an `await` never runs
- **Choose** the right primitive (`ref`, `reactive`, `shallowRef`) for a given
  piece of state
- **Normalise** what a composable accepts with `toRef` / `unref` / `toValue`, and hand
  state out through `readonly()` so only its owner can write
- **Identify** what **Vue 3.5** changed, and check that a project actually runs it

---

# How this chapter works

This is a **fast recap**, not a re-teaching. So we skip the recitation: you get
**six snippets that are already broken**, taken from real projects.

For each one:

1. Read the code and the **symptom** — 60 seconds, out loud
2. Name the **cause** before we reveal it
3. We compare with the fix, and extract the rule

<br />

> Everything after this chapter assumes these six are automatic. If one of them
> surprises you, say so now — that is exactly what this hour is for.

---

# Snippet 1 / 6 — the filter that never moves

```ts
// useFilters.ts
export function useFilters() {
  const state = reactive({ query: '', page: 1 });
  return { ...state, next: () => state.page++ };
}

// FilterBar.vue — <script setup>
const { page, next } = useFilters();
```

```vue
<template>Page {{ page }} <button @click="next">Next</button></template>
```

**The click fires, `state.page` really does increment — the template stays on `1`.
Why?**

<v-click>

> ✅ `...state` **reads** every property once and copies its value. `page` is a plain
> `number`, disconnected from the Proxy — the composable returns a snapshot.
>
> **Fix** — `return { ...toRefs(state), next }`, or build the state from `ref`s and
> never destructure a `reactive` again.

</v-click>

---

# Snippet 2 / 6 — the row that keeps its old style

```ts
const rows = shallowRef<Row[]>([]);

async function load() {
  rows.value = await fetchRows();   // the table renders, all good
}

function markAsRead(row: Row) {
  row.read = true;                  // the row stays "unread" on screen
}
```

**The table fills in correctly, but clicking a row changes nothing. Why?**

<v-click>

> ✅ `shallowRef` tracks **reassignment of `.value` only**. Nothing inside the array
> is wrapped in a Proxy, so the mutation is invisible to the renderer.

```ts
// Fix — replace the array instead of mutating a row in place
rows.value = rows.value.map((r) => (r === row ? { ...r, read: true } : r));
// or go back to `ref`, and pay for a deep Proxy over every row
```

</v-click>

---

# Snippet 3 / 6 — the results for the query before

```ts
const query = ref('');
const results = ref<Hit[]>([]);

watch(query, async (q) => {
  results.value = await search(q);
});
```

**Type `vue` quickly and the list sometimes settles on the hits for `vu`. Why?**

<v-click>

> ✅ Nothing cancels the previous call. Three requests are in flight and the last one
> to **resolve** wins, not the last one **sent**.

```ts
watch(query, async (q) => {
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort());   // 3.5 — or the 3rd callback argument
  results.value = await search(q, controller.signal);
});
```

</v-click>

---

# Snippet 4 / 6 — the measurement one render late

```ts
const list = useTemplateRef<HTMLUListElement>('list');
const height = ref(0);

watch(items, () => {
  height.value = list.value!.scrollHeight;
});
```

**Add a tenth item: `height` still reports the height of the list with nine. Why?**

<v-click>

> ✅ The default `flush: 'pre'` runs the callback **before** the component re-renders,
> so you measure the previous DOM.
>
> **Fix** — `watch(items, cb, { flush: 'post' })`, or `await nextTick()` inside the
> callback. `'sync'` would fire on every single mutation — almost never what you want.

</v-click>

---

# Snippet 5 / 6 — the child that writes to its props

```vue
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>();

function onInput(event: Event) {
  props.modelValue = (event.target as HTMLInputElement).value;
}
</script>

<template><input :value="modelValue" @input="onInput" /></template>
```

**Vue warns in the console, and the parent never sees the new value. What is the
contract here?**

<v-click>

> ✅ Props are **read-only**: the value belongs to the parent. The child owes it an
> `update:modelValue` event — and since 3.4 the compiler writes that plumbing:

```vue
<script setup lang="ts">
const model = defineModel<string>({ required: true });
</script>

<template><input v-model="model" /></template>
```

</v-click>

---

# Snippet 6 / 6 — the input that is never focused

```vue
<script setup lang="ts">
const input = useTemplateRef<HTMLInputElement>('search');

const user = await fetchUser();              // top-level await

const theme = inject(themeKey);              // returns undefined
onMounted(() => input.value?.focus());       // never runs
</script>
```

**The component renders, the user is there — no focus, no error, nothing in the
console. Why?**

<v-click>

> ✅ `inject()` and the lifecycle hooks bind to the **currently active instance**,
> which only exists while `setup` runs **synchronously**. After an `await`, that
> context is gone and both calls are silently no-ops.
>
> **Fix** — call them **before** the `await` (fetch inside `onMounted` or a `watch`);
> a component that awaits at top level needs a `<Suspense>` boundary anyway (chapter 2).

</v-click>

---

# Reference card — the primitives

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

# Reference card — the `ref` toolbox

```ts
import { isRef, unref, toRef, toRefs, toValue } from 'vue';

isRef(maybe);              // type guard — narrows `Ref<T> | T` down to `Ref<T>`
unref(maybe);              // isRef(maybe) ? maybe.value : maybe
toRef(props, 'label');     // ONE property of a reactive object → Ref, still linked
toRef(() => props.label);  // 3.3+ — a getter → read-only Ref (the modern form)
toRefs(state);             // the whole object → { query: Ref, page: Ref }  (snippet 1)
toValue(maybe);            // 3.3+ — unwraps a ref, calls a getter, passes a value through
```

A composable should accept **whatever the caller already has**, and normalise once:

```ts
export function useSearch(query: MaybeRefOrGetter<string>) {
  const results = ref<Hit[]>([]);
  watch(() => toValue(query), async (q) => { results.value = await search(q); });
  return { results };
}
useSearch('vue');   useSearch(queryRef);   useSearch(() => props.query);   // all three
```

- `unref` unwraps **refs only**; `toValue` also calls **getters** — prefer it in new code
- `isRef` belongs in **library code**, where a `Ref<T>` and a `T` reach the same branch

---

# Reference card — `readonly()`, the one-way contract

```ts
const state = reactive({ user: null, token: '' });

function login(credentials: Credentials) { /* the only place that writes */ }

// what leaves the module is a deep read-only Proxy over the SAME source
export const session = readonly(state);
export { login };
```

```ts
session.token = 'x';        // dev warning: "target is readonly" — the write is a no-op
watchEffect(() => track(session.token));   // still reactive: re-runs when login() writes
```

- Read-only ≠ frozen: the proxy **tracks its source**, so `computed` and `watch` keep working
- `shallowReadonly()` guards the first level only — which is exactly what `props` are made
  of under the hood, and why snippet 5 warns instead of throwing
- The `provide` / `inject` pattern: `provide(themeKey, { mode: readonly(mode), toggle })` —
  descendants read, only the owner writes
- Cost: a second Proxy layer. Expose the raw state inside the module, `readonly` at the border

---

# Reference card — watchers and lifecycle

```ts
watch(userId, (id, previousId) => { /* explicit source, lazy */ },
      { immediate: true, flush: 'post' });

watchEffect(() => { /* implicit sources, runs immediately, re-tracks */ });

onMounted(() => observer.observe(el.value!));
onUnmounted(() => observer.disconnect());   // always undo what you did on mount

onErrorCaptured((err, instance, info) => {
  report(err, info);
  return false;                 // stop the error from propagating further up
});
```

- `flush`: `'pre'` (default, before the re-render) · `'post'` (after the DOM update)
  · `'sync'` (every mutation — sparingly)
- Mutations in the same tick are **coalesced** into one render, which is why tests
  `await nextTick()` before asserting (chapter 4)
- Watchers and hooks stop with the component; every subscription needs its teardown —
  a contract composables must honour too (chapter 3)

---

# Reference card — contract and escape hatches

```vue
<script setup lang="ts">
const { label, disabled = false } = defineProps<Props>();   // reactive since 3.5
const emit = defineEmits<{ submit: [value: string]; cancel: [] }>();
const model = defineModel<string>({ required: true });
defineExpose({ focus });          // the only thing a parent ref can reach
</script>
```

```ts
export interface Theme { mode: Ref<'light' | 'dark'>; toggle: () => void }
export const themeKey: InjectionKey<Theme> = Symbol('theme');

provide(themeKey, { mode, toggle });            // ancestor
const theme = inject(themeKey, defaultTheme);   // any descendant → Theme
```

- A **typed `InjectionKey`** turns `provide` / `inject` into a checked contract
- `provide` / `inject` for **cross-cutting concerns** (theme, i18n, config), not for
  app state — that's Pinia's job (chapter 6)
- `useTemplateRef()` (3.5+) decouples the variable name from the `ref` attribute

---

# Vue 3.5 — what changed

- **Reactive Props Destructure** is stable: `const { label } = defineProps<Props>()`
- **`useTemplateRef()`** and **`useId()`** for SSR-safe unique ids
- **`onWatcherCleanup()`** importable outside the watcher callback (snippet 3)
- **Lazy hydration** for async components (see chapter 2)
- Significantly **lower memory usage** on large reactive arrays
- **`useHost()`** / custom element improvements

> Check your project actually runs 3.5+: `npm ls vue`.

---

# Quiz — Question 1 / 5

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

# Quiz — Question 2 / 5

**Since Vue 3.5, what happens to `const { label } = defineProps<Props>()`?**

- **A.** It throws at runtime
- **B.** It works, but `label` is frozen after the first render
- **C.** `label` stays reactive — Reactive Props Destructure is stable
- **D.** It still requires `toRefs(props)` to stay reactive

<v-click>

> ✅ **C** — The compiler rewrites every read of `label` into `props.label`.
> This is one of the few places where destructuring does **not** break reactivity —
> and the reason snippet 1 is about `reactive`, not about props.

</v-click>

---

# Quiz — Question 3 / 5

**Your app needs the current theme in components at every depth. `provide` / `inject`
or Pinia?**

- **A.** Pinia — any shared value belongs in a store
- **B.** `provide` / `inject` with a typed `InjectionKey` — it is a cross-cutting
  concern, scoped to the app instance
- **C.** Neither: a module-level `ref` exported from a `.ts` file
- **D.** `provide` / `inject`, but only with a `string` key so tests can override it

<v-click>

> ✅ **B** — Theme, i18n and config are **cross-cutting concerns**: no business logic,
> no actions, no devtools timeline needed. A `Symbol` key typed as `InjectionKey<Theme>`
> gives the consumers their types for free. Application **state** goes to Pinia.

</v-click>

---

# Quiz — Question 4 / 5

```vue
<SearchInput ref="search" />
```

**The parent holds a ref on the child and calls `search.value.focus()`. What does the
child have to do?**

- **A.** Nothing — a `<script setup>` component is open by default
- **B.** Declare `focus` with `defineExpose({ focus })`
- **C.** Emit a `focus` event the parent listens to
- **D.** Replace the template ref with `provide` / `inject`

<v-click>

> ✅ **B** — A `<script setup>` component is **closed** by default: the parent sees only
> what `defineExpose()` publishes. That is what makes the public surface of a component
> explicit, exactly like `props` and `emits`.

</v-click>

---

# Quiz — Question 5 / 5

```ts
export function usePagination(total: MaybeRefOrGetter<number>) { /* ... */ }
```

**The three call sites below must all work. How do you read `total` inside the composable?**

`usePagination(42)` · `usePagination(totalRef)` · `usePagination(() => props.total)`

- **A.** `total.value` — every caller has to pass a ref
- **B.** `unref(total)`, read inside a `computed`
- **C.** `toValue(total)`, read inside a `computed` or a watch source
- **D.** `isRef(total) ? total.value : total`, resolved once in the composable body

<v-click>

> ✅ **C** — `unref` (B) handles the ref and the plain number, but hands the third caller
> back the **function itself**. **D** does the same *and* reads **once**, outside any
> reactive scope. `toValue()` unwraps a ref, calls a getter, passes a value through — and
> because the call happens **inside** the computed, the dependency is tracked.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 1 - Warm-up
- Read the starter project of workshop 2 and identify: the props contract, the
  reactive state and the watchers
- Convert one `props` + `emit('update:modelValue')` pair to `defineModel` (snippet 5)
- Find, in the codebase, one instance of a snippet you have just diagnosed — and
  say which one

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
