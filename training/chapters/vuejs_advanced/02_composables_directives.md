---
layout: cover
---

# 2 - Composables & custom directives

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Write** a `useXxx` composable that returns refs and cleans up its own effects
- **Design** a flexible API by accepting `MaybeRefOrGetter` arguments and
  unwrapping them with `toValue`
- **Choose** between per-instance state and module-scope shared state, and say what
  the singleton costs you
- **Decide**, for a given need, between a composable and a custom directive
- **Implement** a custom directive with the right hooks, `binding` values and
  cleanup on `unmounted`

---

# What is a composable?

> A **composable** is a function that uses Vue's Composition API to encapsulate
> and reuse **stateful logic**.

- Plain JavaScript/TypeScript function, named **`useSomething`**
- Can create reactive state, computed values, watchers and lifecycle hooks
- Returns whatever the caller needs — refs, computed, functions

<br />

| | Mixin (Vue 2) | Composable (Vue 3) |
|---|---|---|
| Origin of a property | Implicit, unclear | Explicit, from the return value |
| Name collisions | Silent | Impossible (you name the variables) |
| TypeScript support | Poor | Full inference |
| Composability | Flat merge | Nested calls |

---

# A first composable

```ts
// composables/useCounter.ts
import { ref, computed, type Ref, type ComputedRef } from 'vue';

export interface UseCounterReturn {
  count: Ref<number>;
  double: ComputedRef<number>;
  increment: () => void;
  reset: () => void;
}

export function useCounter(initial = 0): UseCounterReturn {
  const count = ref(initial);
  const double = computed(() => count.value * 2);

  const increment = (): void => { count.value += 1; };
  const reset = (): void => { count.value = initial; };

  return { count, double, increment, reset };
}
```

---

# Using it

```vue
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter';

const { count, double, increment } = useCounter(10);
const cart = useCounter();          // an independent instance
</script>

<template>
  <button @click="increment">{{ count }} / {{ double }}</button>
</template>
```

- Each call creates **its own state** — no shared instance by default
- Destructuring works because we return **refs**, not a `reactive` object

---

# Conventions that matter

1. **Name it `useXxx`** — signals it may use Composition API features
2. **Return refs**, not a `reactive` object, so destructuring stays reactive
3. Call it **synchronously in `setup`** if it registers lifecycle hooks
4. **Clean up** everything you subscribe to
5. Accept **`MaybeRefOrGetter`** arguments so callers can pass a value, a ref or a getter

```ts
import { toValue, type MaybeRefOrGetter } from 'vue';

export function useTitle(source: MaybeRefOrGetter<string>) {
  watchEffect(() => { document.title = toValue(source); });
}

useTitle('Home');                       // plain value
useTitle(pageTitle);                    // ref
useTitle(() => `${user.value.name}`);   // getter
```

---

# Cleanup and lifecycle

```ts
// composables/useEventListener.ts
import { onMounted, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue';

export function useEventListener<K extends keyof WindowEventMap>(
  target: MaybeRefOrGetter<EventTarget | null>,
  event: K,
  handler: (e: WindowEventMap[K]) => void,
): void {
  onMounted(() => toValue(target)?.addEventListener(event, handler as EventListener));
  onUnmounted(() => toValue(target)?.removeEventListener(event, handler as EventListener));
}
```

- The composable owns the **whole lifecycle** of the subscription
- The consuming component has nothing to remember — that's the point

---

# An async data composable

```ts
export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = shallowRef<T | null>(null);
  const error = shallowRef<Error | null>(null);
  const loading = ref(false);

  watchEffect(async (onCleanup) => {
    const controller = new AbortController();
    onCleanup(() => controller.abort());

    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(toValue(url), { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data.value = (await res.json()) as T;
    } catch (e) {
      if ((e as Error).name !== 'AbortError') error.value = e as Error;
    } finally {
      loading.value = false;
    }
  });

  return { data, error, loading };
}
```

---

# Per-instance vs shared state

```ts
// Per-instance: state created inside the function
export function useCounter() {
  const count = ref(0);        // new for every caller
  return { count };
}

// Shared: state created at module scope
const theme = ref<'light' | 'dark'>('light');
export function useTheme() {
  return { theme };            // the same ref for everyone
}
```

- Module-scope state is a **singleton for the whole app** — convenient, but:
  - It breaks **SSR** (state leaks between requests)
  - It makes **tests** order-dependent
- For real application state, use **Pinia** — the full decision tree
  (`ref` vs shared composable vs `provide` / `inject` vs store) is in chapter 9

---

# VueUse — don't rewrite the basics

```bash
npm install @vueuse/core
```

```ts
import { useLocalStorage, useIntersectionObserver, useDebounceFn } from '@vueuse/core';

const token = useLocalStorage('token', '');
const search = useDebounceFn(doSearch, 300);
```

- 200+ audited, tree-shakeable, SSR-safe composables
- Read their source — it is a great catalogue of composable patterns

> Still write your own for **business logic**. VueUse covers the plumbing.

---

# Custom directives

> A **directive** is a reusable piece of logic that needs **low-level DOM access**.

```ts
const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
};
```

```vue
<script setup lang="ts">
// In <script setup>, any `vXxx` camelCase variable is a directive
const vFocus = { mounted: (el: HTMLElement) => el.focus() };
</script>

<template>
  <input v-focus />
</template>
```

> Use a directive when you need the **element itself**. For anything else,
> a composable or a component is a better fit.

---

# The directive hooks

```ts
import type { Directive, DirectiveBinding } from 'vue';

const vHighlight: Directive<HTMLElement, string> = {
  created(el, binding, vnode, prevVnode) {},     // before attributes are applied
  beforeMount(el, binding) {},                   // before insertion in the DOM
  mounted(el, binding) {},                       // inserted — the common one
  beforeUpdate(el, binding) {},                  // before the parent updates
  updated(el, binding) {},                       // after the parent updated
  beforeUnmount(el, binding) {},                 // before removal
  unmounted(el, binding) {},                     // removed — clean up here
};
```

- Registering only a function is a shortcut for `mounted` **+** `updated`

```ts
const vColor: Directive<HTMLElement, string> = (el, binding) => {
  el.style.color = binding.value;
};
```

---

# The `binding` object

```vue
<div v-tooltip:top.delay="message" />
```

```ts
const vTooltip: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    binding.value;      // the message — result of the expression
    binding.oldValue;   // previous value (updated / beforeUpdate only)
    binding.arg;        // 'top'
    binding.modifiers;  // { delay: true }
    binding.instance;   // the component instance using the directive
    binding.dir;        // the directive definition itself
  },
};
```

- Dynamic argument: `v-tooltip:[position]="message"`
- Passing several values: use an **object literal** — `v-tooltip="{ text, delay: 300 }"`

---

# Recap

- A **composable** is the default tool for reusing stateful logic — small, named
  `useXxx`, returning refs, cleaning up after itself
- Accept `MaybeRefOrGetter` and unwrap with `toValue` for a flexible API
- Module-scope state is an app-wide singleton: it leaks between SSR requests and
  makes tests order-dependent — real application state belongs in Pinia
- Reach for **VueUse** before rewriting the plumbing; keep your own for business logic
- A **directive** is for logic that genuinely needs the DOM element — its hooks and
  its `binding` are the whole API
- Always disconnect observers and listeners in `unmounted`

---

# Quiz — Question 1 / 3

**Why does a composable return refs rather than a `reactive` object?**

- **A.** Because `reactive` cannot hold functions
- **B.** So the caller can destructure the result without losing reactivity
- **C.** Because refs are faster than proxies
- **D.** Because `reactive` is deprecated since Vue 3.5

<v-click>

> ✅ **B** — `const { count, increment } = useCounter()` only works because `count`
> is a ref. Returning a `reactive` object would force every caller to keep the
> object around, or to call `toRefs` themselves.

</v-click>

---

# Quiz — Question 2 / 3

**What do `MaybeRefOrGetter` and `toValue` buy you?**

- **A.** Deep reactivity on plain objects
- **B.** Automatic cleanup of the watchers you create
- **C.** Callers may pass a plain value, a ref or a getter — the composable handles
  all three
- **D.** SSR-safe access to `window`

<v-click>

> ✅ **C** — One signature, three call styles: `useTitle('Home')`,
> `useTitle(pageTitle)`, `useTitle(() => user.value.name)`. `toValue` unwraps
> whichever one you got.

</v-click>

---

# Quiz — Question 3 / 3

**A composable declares its state at module scope. What is the consequence?**

- **A.** Nothing — that is the recommended way to share state
- **B.** Every caller gets an independent copy
- **C.** The state is no longer reactive
- **D.** It becomes an app-wide singleton: SSR leaks it between requests and tests
  become order-dependent

<v-click>

> ✅ **D** — Convenient for a theme toggle in a client-only app, dangerous
> everywhere else. For real application state, use **Pinia** (chapter 9).

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2 - Composables & directives
