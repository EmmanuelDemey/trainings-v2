---
layout: cover
---

# 3 - Composables & custom directives

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
- For real application state, use **Pinia** (chapter 6)

---

# Composing composables

```ts
export function useSearchResults(query: Ref<string>) {
  const debounced = useDebounce(query, 300);
  const url = computed(() => `/api/search?q=${encodeURIComponent(debounced.value)}`);
  const { data, loading, error } = useFetch<Result[]>(url);

  const isEmpty = computed(() => !loading.value && data.value?.length === 0);

  return { results: data, loading, error, isEmpty };
}
```

- Composables call other composables — this is where they beat mixins
- Build **small, single-purpose** composables and assemble them

---

# `effectScope` — owning effects outside a component

```ts
import { effectScope } from 'vue';

const scope = effectScope();

scope.run(() => {
  const count = ref(0);
  watch(count, () => { /* ... */ });
  watchEffect(() => { /* ... */ });
});

scope.stop();     // stops every watcher created inside, in one call
```

- Useful for composables used **outside** a component (a store, a plugin, a worker)
- `onScopeDispose(fn)` registers a cleanup that runs when the scope stops
- This is exactly how Pinia disposes of a store

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

# Global registration

```ts
// main.ts
import { createApp } from 'vue';
import { vTooltip } from './directives/tooltip';

const app = createApp(App);
app.directive('tooltip', vTooltip);
app.mount('#app');
```

Better: package your directives as a **plugin**

```ts
// directives/index.ts
import type { App } from 'vue';

export const directivesPlugin = {
  install(app: App): void {
    app.directive('tooltip', vTooltip);
    app.directive('lazy-img', vLazyImg);
  },
};

app.use(directivesPlugin);
```

---

# Directives on components — careful

```vue
<MyButton v-highlight="'red'" />
```

- The directive applies to the component's **single root element**
- If the component has **multiple root nodes**, the directive is **ignored** and
  Vue logs a warning
- The child can opt in explicitly:

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
<template>
  <div v-bind="$attrs"><slot /></div>
</template>
```

> Prefer directives on **plain elements**. It keeps the ownership obvious.

---

# Directives and SSR

- On the server there is **no DOM**: `mounted` and `updated` never run
- Only `created` and `beforeMount` execute — and `el` is not a real element
- For a directive that must affect the server-rendered HTML, declare
  `getSSRProps`:

```ts
const vTheme: Directive<HTMLElement, string> = {
  mounted(el, binding) { el.dataset.theme = binding.value; },
  getSSRProps(binding) {
    return { 'data-theme': binding.value };   // rendered into the HTML string
  },
};
```

- Always guard `window` / `document` access — a directive can be imported in SSR

---

# Case study — lazy loading images

The goal: `<img v-lazy-img="url" />` loads the real image **only when it becomes
visible**, and shows a placeholder in the meantime.

<br />

Requirements:

1. Set a lightweight placeholder immediately
2. Observe the element with an **`IntersectionObserver`**
3. When it intersects, swap in the real `src`
4. Handle **load errors** with a fallback image
5. **Disconnect** the observer on unmount — and when the image has loaded
6. Support a **value change** (`updated`) and a **root margin** modifier

---

# Case study — the directive

```ts
// directives/lazyImg.ts
import type { Directive } from 'vue';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E';

const observers = new WeakMap<HTMLImageElement, IntersectionObserver>();

function observe(el: HTMLImageElement, src: string, rootMargin: string): void {
  observers.get(el)?.disconnect();

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;

      el.src = src;                       // triggers the real download
      observer.disconnect();
      observers.delete(el);
    },
    { rootMargin },
  );

  observer.observe(el);
  observers.set(el, observer);
}
```

---

# Case study — the hooks

```ts
export const vLazyImg: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    el.src = PLACEHOLDER;
    el.addEventListener('error', () => { el.src = '/images/fallback.png'; },
      { once: true });

    // Progressive enhancement: no observer ➜ load immediately
    if (!('IntersectionObserver' in window)) {
      el.src = binding.value;
      return;
    }
    observe(el, binding.value, binding.modifiers.eager ? '400px' : '0px');
  },

  updated(el, binding) {
    if (binding.value === binding.oldValue) return;
    observe(el, binding.value, binding.modifiers.eager ? '400px' : '0px');
  },

  unmounted(el) {
    observers.get(el)?.disconnect();
    observers.delete(el);
  },
};
```

---

# The same thing, as a composable

```ts
// composables/useLazyImage.ts
import { useIntersectionObserver } from '@vueuse/core';

export function useLazyImage(target: Ref<HTMLImageElement | null>, src: Ref<string>) {
  const loaded = ref(false);

  const { stop } = useIntersectionObserver(target, ([entry]) => {
    if (!entry.isIntersecting) return;
    target.value!.src = src.value;
    loaded.value = true;
    stop();
  });

  return { loaded };
}
```

<br />

| Directive | Composable |
|---|---|
| Reusable on **any element**, in any template | Needs a template ref per usage |
| No state exposed to the component | Returns state you can render on |
| Harder to unit-test | Trivially testable |

---

# Native alternative — know it exists

```html
<img src="photo.jpg" loading="lazy" decoding="async" width="800" height="600" />
```

- Supported by every modern browser, **zero JavaScript**
- Always set `width` / `height` (or `aspect-ratio`) to avoid layout shift

<br />

> Write the directive when you need **more** than the native behaviour:
> blur-up placeholders, custom root margins, analytics, `srcset` switching,
> retry on error. Otherwise, ship the attribute.

---

# Recap

- A **composable** is the default tool for reusing stateful logic — small, named
  `useXxx`, returning refs, cleaning up after itself
- Accept `MaybeRefOrGetter` and unwrap with `toValue` for a flexible API
- `effectScope` lets a composable own its effects outside a component
- A **directive** is for logic that genuinely needs the DOM element
- Directives run `created` / `beforeMount` only on the server — add `getSSRProps`
- Always disconnect observers and listeners in `unmounted`

---
layout: cover
---

# Hands-on

## Workshop 3 - Composables & directives
- Write `useFetch` with abort-on-change and a `MaybeRefOrGetter` URL
- Write `useLocalStorage<T>` that syncs a ref with `localStorage` (and survives
  a JSON parse error)
- Compose both into a `useFavorites` composable used by two components
- Implement the **`v-lazy-img`** directive: placeholder, `IntersectionObserver`,
  error fallback, `updated` support, cleanup on `unmounted`
- Register the directives as an app **plugin**

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
