---
layout: cover
---

# Annexe — Composables & directives

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

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

# Quiz — Question 1 / 1

**Your directive must affect the server-rendered HTML. What do you write?**

- **A.** The logic in `mounted` — it also runs on the server
- **B.** A `getSSRProps(binding)` returning the attributes to render
- **C.** The logic in `beforeUpdate`, the only hook available during SSR
- **D.** Nothing — a directive can never influence the SSR output

<v-click>

> ✅ **B** — On the server only `created` and `beforeMount` run, and `el` is not a
> real element. `getSSRProps` is the single hook whose return value ends up in the
> HTML string.

</v-click>

