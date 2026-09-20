---
layout: cover
---

# 9 - State management with Pinia

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** between a local `ref`, a shared composable, `provide` / `inject`, a
  store and a query layer — by reading the decision tree **top to bottom**
- **Write** setup stores and **destructure** them safely with `storeToRefs`
- **Build** indexed getters instead of returning an O(n) lookup function
- **Cut** the reactivity cost of large payloads with `shallowRef` and `markRaw`
- **Group** mutations with `$patch`, and give a setup store the `$reset` it does
  not have
- **Write** a typed Pinia plugin, and an async action that owns its `status`, its
  `error` and the cancellation of the previous request

---

# Where should this state live?

```
                    a new piece of state
                              │
                              ▼
      ┌────────────────────────────────────────────────┐
      │  Does it come from the server?                 │──yes──▶  a query layer
      └───────────────────────┬────────────────────────┘          vue-query, Pinia Colada
                              │ no
                              ▼
      ┌────────────────────────────────────────────────┐
      │  Read or written outside one component?        │──no───▶  a ref() in the component,
      └───────────────────────┬────────────────────────┘          or a per-instance composable
                              │ yes
                              ▼
      ┌────────────────────────────────────────────────┐
      │  Scoped to a subtree — several independent     │──yes──▶  provide / inject
      │  instances alive at the same time?             │          with a typed InjectionKey
      └───────────────────────┬────────────────────────┘
                              │ no — one single instance for the whole app
                              ▼
      ┌────────────────────────────────────────────────┐
      │  Needs SSR, devtools, HMR, plugins,            │──no───▶  a shared composable
      │  isolation between tests?                      │          (module-scope ref)
      └───────────────────────┬────────────────────────┘
                              │ yes
                              ▼
                            Pinia
```

- Read it **top to bottom**: each question you answer *no* keeps the state one
  step **smaller** than a store
- Most teams read it backwards — they open `stores/` first, and every `ref` ends
  up global

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.25;
}
ul { font-size: 0.85em; }
</style>

---

# Recap — the two store syntaxes

```ts
// Option store — close to Vuex
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as CartItem[] }),
  getters: { total: (s) => s.items.reduce((n, i) => n + i.price * i.qty, 0) },
  actions: { add(item: CartItem) { this.items.push(item); } },
});
```

```ts
// Setup store — the Composition API syntax
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const total = computed(() => items.value.reduce((n, i) => n + i.price * i.qty, 0));
  function add(item: CartItem): void { items.value.push(item); }

  return { items, total, add };
});
```

> **Prefer setup stores**: you can use composables, watchers and `effectScope`,
> and TypeScript inference is better.

---

# The rule that bites everyone

```ts
const cart = useCartStore();

const { items, total } = cart;            // ❌ reactivity lost
const { items, total } = storeToRefs(cart); // ✅ refs
const { add } = cart;                      // ✅ actions are plain functions
```

- A store instance is a `reactive` object — destructuring **unwraps** it
- `storeToRefs` converts state and getters to refs, and **skips** the actions

<br />

```ts
// Also: never call useStore() at module scope
const cart = useCartStore();     // ❌ Pinia isn't installed yet at import time

export function doThing() {
  const cart = useCartStore();   // ✅ inside a function / setup
}
```

---

# Getters, and when they are not enough

```ts
const total = computed(() => items.value.reduce((n, i) => n + i.price * i.qty, 0));
```

- A getter is a **`computed`**: cached, recomputed only when a dependency changes
- A getter that takes an argument **cannot be cached** — it returns a function:

```ts
const itemById = computed(() => (id: number) => items.value.find((i) => i.id === id));
// cart.itemById(42)  ➜ recomputed on every call
```

Better for repeated lookups — build the index once:

```ts
const byId = computed(() => new Map(items.value.map((i) => [i.id, i])));
// cart.byId.get(42)  ➜ O(1), cached
```

---

# Reactivity cost: `shallowRef` and `markRaw`

```ts
export const useCatalogStore = defineStore('catalog', () => {
  // 20 000 products, replaced wholesale, never mutated in place
  const products = shallowRef<Product[]>([]);

  async function load(): Promise<void> {
    products.value = await api.get<Product[]>('/products');   // triggers
  }

  // A non-reactive third-party instance
  const map = markRaw(new MapLibreGL.Map({ container: 'map' }));

  return { products, load, map };
});
```

- `reactive()` walks **every nested property** — expensive on large payloads
- `shallowRef` only tracks **reassignment** — use `triggerRef()` for in-place edits
- `markRaw` excludes an object from reactivity entirely (class instances, maps, sockets)

---

# Bulk updates and resets

```ts
cart.$patch({ shipping: 4.9, coupon: 'SPARKS' });    // one single reactivity trigger

cart.$patch((state) => {                             // function form for arrays
  state.items.push(newItem);
  state.lastUpdated = Date.now();
});

cart.$reset();          // option stores only — setup stores need a custom reset
```

For a setup store, write your own:

```ts
const initial = (): CartState => ({ items: [], coupon: null });
const state = ref(initial());
function $reset(): void { state.value = initial(); }
```

- `$patch` avoids N separate re-renders when mutating several fields

---

# Pinia plugins

```ts
import type { PiniaPluginContext } from 'pinia';

export function loggerPlugin({ store, options }: PiniaPluginContext): void {
  store.$onAction(({ name, after, onError }) => {
    after(() => console.log(`✅ ${store.$id}.${name}`));
    onError((e) => console.error(`❌ ${store.$id}.${name}`, e));
  });
}
```

```ts
const pinia = createPinia();
pinia.use(loggerPlugin);
```

- A plugin runs **once per store**, at creation time
- `context` gives you `pinia`, `app`, `store` and the store's `options`

---

# Async actions and request state

```ts
export const useInvoicesStore = defineStore('invoices', () => {
  const items = shallowRef<Invoice[]>([]);
  const status = ref<'idle' | 'loading' | 'error'>('idle');
  const error = ref<Error | null>(null);
  let inflight: AbortController | null = null;

  async function fetchAll(): Promise<void> {
    inflight?.abort();                       // cancel the previous request
    inflight = new AbortController();

    status.value = 'loading';
    try {
      items.value = await api.get<Invoice[]>('/invoices', { signal: inflight.signal });
      status.value = 'idle';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      error.value = e as Error;
      status.value = 'error';
    }
  }

  return { items, status, error, fetchAll };
});
```

---

# Recap

- Pick the **narrowest reach** that works: a local `ref` ➜ a shared composable ➜
  `provide` / `inject` ➜ Pinia — and a **query layer** for anything that came from
  the server
- **Setup stores** by default; `storeToRefs` to destructure state and getters, and
  never call `useXxxStore()` at module scope
- Getters are `computed` — build **indexes**, don't return lookup functions
- `shallowRef` / `markRaw` for large or non-reactive payloads
- `$patch` for bulk updates, one trigger instead of N; a setup store needs its own
  `$reset`
- **Plugins** run once per store, at creation — `$onAction` there gives you logging
  and error reporting across every store at once
- An async action carries its own `status`, `error` and `AbortController`. That is
  the honest floor for a handful of endpoints — the first branch of the decision
  tree is where you hand the rest to a query layer

---

# Quiz — Question 1 / 3

```ts
const { items, total, add } = useCartStore();
```

**What is wrong here?**

- **A.** Nothing — a store is already a set of refs
- **B.** `items` and `total` lose their reactivity; only `add` still works
- **C.** `add` loses its binding to the store
- **D.** Pinia throws in development mode

<v-click>

> ✅ **B** — A store instance is a `reactive` object, so destructuring unwraps state
> and getters. Use `storeToRefs(cart)` for `items` / `total`; actions are plain
> functions and can be destructured as-is.

</v-click>

---

# Quiz — Question 2 / 3

```ts
const itemById = computed(() => (id: number) => items.value.find((i) => i.id === id));
```

**What is the problem with this getter?**

- **A.** It cannot be typed properly
- **B.** It returns a function, so nothing is cached — every call re-runs the lookup
- **C.** It breaks `$subscribe`
- **D.** It makes the store non-serializable

<v-click>

> ✅ **B** — The `computed` caches the *function*, not its results. Build the index
> instead: `const byId = computed(() => new Map(items.value.map(i => [i.id, i])))`,
> then `byId.get(42)` in O(1).

</v-click>

---

# Quiz — Question 3 / 3

**What does `cart.$patch({ shipping: 4.9, coupon: 'SPARKS' })` change compared to
two separate assignments?**

- **A.** Nothing, it is only nicer syntax
- **B.** It triggers reactivity once instead of twice
- **C.** It bypasses `$subscribe`
- **D.** It is the only legal way to mutate state outside an action

<v-click>

> ✅ **B** — One mutation, one notification, one re-render. `$subscribe` still fires,
> with `mutation.type === 'patch object'`. Use the function form when you need to
> push into an array.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 9 - Pinia
