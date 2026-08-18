---
layout: cover
---

# 6 - State management with Pinia

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Write** setup stores and **destructure** them safely with `storeToRefs`
- **Normalize** state and **build** indexed getters instead of O(n) lookups
- **Cut** the render cost with `shallowRef` / `markRaw` and targeted subscriptions
- **Split** state by domain and **compose** stores with one another
- **React** to state and actions with `$patch`, `$subscribe` and `$onAction`
- **Write** a typed Pinia plugin — persistence, logging — and **enable** HMR on
  every store

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

# Normalizing state

```ts
// ❌ O(n) on every update, duplicated data
const orders = ref<Order[]>([]);

// ✅ normalized
const ordersById = ref<Record<number, Order>>({});
const orderIds = ref<number[]>([]);

const orders = computed(() => orderIds.value.map((id) => ordersById.value[id]));
```

- Updating one entity no longer touches the array identity
- No duplicated entity across several lists
- The pattern scales: it is what every serious data layer does

> Don't normalize by default — do it when a list grows past a few hundred items
> or the same entity appears in several places.

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

# Optimizing subscriptions

```vue
<script setup lang="ts">
const cart = useCartStore();
const { total } = storeToRefs(cart);    // ✅ this component re-renders on total only
</script>
```

- Reading `cart.items` in a template subscribes the component to **`items`**
- Read the **narrowest** value you need — a getter, not the whole collection
- Split large stores by **domain** (`useCartStore`, `useUserStore`, `useUiStore`)
  rather than one god store

<br />

> Measure before reorganizing anything: record a **Timeline**, click once, and count
> the component updates — the method from the Devtools sequence in day 1.

---

# Cross-store composition

```ts
export const useCheckoutStore = defineStore('checkout', () => {
  const cart = useCartStore();          // ✅ inside the setup function
  const auth = useAuthStore();

  const canCheckout = computed(() =>
    auth.isAuthenticated && cart.items.length > 0
  );

  async function submit(): Promise<Order> {
    const order = await api.post<Order>('/orders', { items: cart.items });
    cart.clear();
    return order;
  }

  return { canCheckout, submit };
});
```

- Stores are **flat and independent** — no nested modules like Vuex
- Beware of **circular dependencies**: A ➜ B ➜ A works, but is a design smell

---

# Reacting to a store: `$subscribe` and `$onAction`

```ts
// Every state mutation
cart.$subscribe((mutation, state) => {
  localStorage.setItem('cart', JSON.stringify(state));
}, { detached: false, deep: true });
```

```ts
// Every action call
cart.$onAction(({ name, store, args, after, onError }) => {
  const start = performance.now();

  after((result) => {
    console.log(`${name} took ${performance.now() - start}ms`);
  });

  onError((error) => {
    reportToSentry(error, { action: name, args });
  });
});
```

- `mutation.type`: `direct`, `patch object` or `patch function`
- Both return an **unsubscribe** function; they auto-dispose with the component

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

# What a plugin can add

```ts
export function routerPlugin({ store }: PiniaPluginContext) {
  // Anything returned is merged into every store
  return { router: markRaw(router) };
}

export function persistPlugin({ store, options }: PiniaPluginContext) {
  if (!options.persist) return;                       // opt-in per store

  const key = `pinia:${store.$id}`;
  const saved = localStorage.getItem(key);
  if (saved) store.$patch(JSON.parse(saved) as object);

  store.$subscribe((_, state) => {
    localStorage.setItem(key, JSON.stringify(state));
  });
}
```

```ts
defineStore('cart', setup, { persist: true });    // custom option, read above
```

---

# Typing a custom store option

```ts
// pinia.d.ts
import 'pinia';

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | { paths: string[] };
  }

  export interface PiniaCustomProperties {
    router: Router;              // added by routerPlugin
  }
}
```

- Without this, `options.persist` and `store.router` are type errors
- Off-the-shelf alternative: **`pinia-plugin-persistedstate`**

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

# Hot Module Replacement

```ts
export const useCartStore = defineStore('cart', () => { /* ... */ });

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
```

- Without it, editing a store **full-reloads** the page and you lose your state
- Two lines per store file, well worth it during a workshop

---

# SSR and state hydration

```ts
// Server
const pinia = createPinia();
app.use(pinia);
// ... render ...
html = html.replace('<!--pinia-->',
  `<script>window.__PINIA__=${devalue(pinia.state.value)}</script>`);
```

```ts
// Client
if (window.__PINIA__) pinia.state.value = window.__PINIA__;
```

- Never keep **module-scope** state outside a store on the server — it leaks
  between requests
- Nuxt does all of this for you

---

# Testing stores

```ts
import { setActivePinia, createPinia } from 'pinia';

beforeEach(() => setActivePinia(createPinia()));

it('computes the total', () => {
  const cart = useCartStore();
  cart.add({ id: 1, price: 10, qty: 2 });
  expect(cart.total).toBe(20);
});
```

```ts
// In a component test: stub every action
import { createTestingPinia } from '@pinia/testing';

const wrapper = mount(Cart, {
  global: { plugins: [createTestingPinia({
    createSpy: vi.fn,
    initialState: { cart: { items: [item] } },
  })] },
});

expect(useCartStore().add).toHaveBeenCalledWith(item);
```

---

# Recap

- **Setup stores** by default; `storeToRefs` to destructure state and getters
- Getters are `computed` — build **indexes**, don't return lookup functions
- `shallowRef` / `markRaw` for large or non-reactive payloads
- Split by **domain**; compose stores by calling one inside another's setup
- `$patch` for bulk updates, `$subscribe` / `$onAction` for side effects
- **Plugins** for cross-cutting concerns: persistence, logging, injected services
- `acceptHMRUpdate` in every store file

---

# Quiz — Question 1 / 4

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

# Quiz — Question 2 / 4

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

# Quiz — Question 3 / 4

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

# Quiz — Question 4 / 4

**You call `store.$reset()` on a setup store. What happens?**

- **A.** It resets the state to its initial value
- **B.** It resets the getters only
- **C.** It throws — `$reset` exists on option stores only
- **D.** It works, but only if the persistence plugin is installed

<v-click>

> ✅ **C** — A setup store has no declarative `state()` for Pinia to replay. Expose
> your own: keep an `initial()` factory and a `$reset()` function in the returned
> object.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 6 - Pinia
- Split a god store into `useCartStore`, `useCatalogStore` and `useUiStore`
- Replace an O(n) `itemById` getter with a cached `Map` index and measure the diff
- Switch a 10 000-product list to `shallowRef` and observe the render timings
- Write a **persistence plugin** with an opt-in `persist` store option, and type it
- Add an **`$onAction`** plugin that logs action duration and reports errors
- Enable **HMR** on every store

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
