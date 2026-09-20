---
layout: cover
---

# Annexe — State management with Pinia

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

---

# The three options, side by side

| | **shared composable** | **`provide` / `inject`** | **Pinia** |
|---|---|---|---|
| Scope | the module graph | one component subtree | the app |
| Instances | one, for the process | one per providing component | one per `createPinia()` |
| Created on | first `import` | the ancestor's `setup()` | first `useXxxStore()` |
| Read from | an `import` | `inject(key)`, descendants only | `useXxxStore()`, anywhere |
| Outside a component | ✅ | ❌ `app.runWithContext()` | ✅ once the app exists |
| SSR | ❌ leaks across requests | ✅ one tree per request | ✅ one Pinia per request |
| Test isolation | ❌ shared module cache | ✅ mount a fresh tree | ✅ `createTestingPinia()` |
| Devtools | ❌ | component inspector only | ✅ own tab, time travel |
| HMR | ❌ full reload | ❌ full reload | ✅ `acceptHMRUpdate` |
| Plugins | — | — | ✅ persistence, logging |
| Runtime cost | 0 kB | 0 kB | ~1.5 kB gzip |

> The three are **not** competitors on the same axis: they differ by **who can reach
> the state**. Pick the narrowest reach that satisfies the feature.

<style>
table { font-size: 0.7em; }
th, td { padding: 0.25em 0.6em; }
blockquote { font-size: 0.85em; }
</style>

---

# `provide` / `inject` — scoped state, not global state

```ts
// wizard/context.ts
import { provide, inject, ref, computed, readonly, type InjectionKey } from 'vue';

export interface WizardContext { /* index, current, next */ }
const wizardKey = Symbol('wizard') as InjectionKey<WizardContext>;

export function provideWizard(steps: string[]): WizardContext {
  const index = ref(0);
  const context: WizardContext = {
    index: readonly(index),                                  // descendants read
    current: computed(() => steps[index.value]),
    next: () => { index.value = Math.min(index.value + 1, steps.length - 1); },
  };
  provide(wizardKey, context);                               // ancestors write
  return context;
}

export function useWizard(): WizardContext {
  const context = inject(wizardKey);
  if (!context) throw new Error('useWizard() must be called inside <Wizard>');
  return context;                                            // never undefined
}
```

- Two `<Wizard>` on the same page ➜ **two independent states** — a module-scope
  `ref` could not do that, and a store would need an id-keyed map
- Ship the **pair**, not the key: `provideXxx` / `useXxx`, the symbol stays private
- `readonly()` on what must not be mutated from below; expose intent-named actions
- `inject()` resolves **synchronously during `setup()`** — after an `await` it
  returns `undefined`

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.35;
}
ul { font-size: 0.78em; }
</style>

---

# Signals that you picked wrong

| Symptom | What it actually means | Move to |
|---|---|---|
| A router guard or an HTTP interceptor needs the state | it must live **outside** the component tree | **Pinia** |
| Two instances of the feature fight over the same values | your singleton needs a **scope** | **`provide` / `inject`** |
| Tests pass alone, fail in the suite | module-scope state **leaks between tests** | **Pinia** + `createTestingPinia()` |
| SSR serves one user's data to another | a module-scope singleton on the server | **Pinia**, one per request |
| The store is mostly `data` / `loading` / `error` triplets | it is **server** state, not client state | a **query layer** |
| Only one component has ever read it | premature globalization | a plain **`ref()`** |

<br />

> Moving *up* the tree — from a `ref` to a store — is a refactor of a few lines.
> Moving *down*, once the whole app imports `useCartStore()`, is not. Start small.

<style>
table { font-size: 0.72em; }
th, td { padding: 0.3em 0.7em; }
blockquote { font-size: 0.85em; }
</style>

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

# Server state is not client state

The store above handles **loading**, **error** and **cancellation**. It still does not
handle:

- **Deduplication** — three components mounting together fire three requests
- **Caching** — coming back to the list refetches everything from scratch
- **Staleness** — nothing says when the data is old enough to be refreshed
- **Revalidation** — on window focus, on reconnect, on an interval
- **Invalidation** — after a `POST`, who tells the list to reload?
- **Retry**, **pagination**, **optimistic updates**, **SSR hydration**

<br />

> Remote data is **shared**, **asynchronous** and **stale the moment you read it**.
> Pinia is excellent at client state — filters, UI, the current user. Hand the rest
> to a query layer instead of re-implementing it store by store.

---

# TanStack Query or Pinia Colada?

| | **`@tanstack/vue-query`** | **`@pinia/colada`** |
|---|---|---|
| Origin | port of the React library, v5 | written for Vue by the Pinia / Vue Router author |
| Runtime | its own `QueryClient` | built **on top of Pinia** — one cache store |
| Size | ~14 kB gzip | ~5 kB gzip, ~2 kB tree-shaken |
| Cache key | `queryKey`, refs unwrapped | `key`, array or getter |
| Fetcher | `queryFn` | `query` |
| Request state | `isPending` + `isFetching` | `status` **and** `asyncStatus`, split on purpose |
| Devtools | its own panel, React-based | **Vue Devtools**, right next to your stores |
| Router | wire the prefetch yourself | official **Data Loaders** for Vue Router |
| Ecosystem | huge: infinite, offline, persistence | smaller, growing: retry, auto-refetch, delay |
| Maturity | battle-tested, frozen API | 1.x — stable, but younger |

> Same mental model on both sides. Pick **Colada** if you are already all-in on Pinia
> and want Vue Devtools; pick **TanStack** for the ecosystem, or when the team already
> knows it from React.

<style>
table { font-size: 0.72em; }
th, td { padding: 0.3em 0.7em; }
blockquote { font-size: 0.88em; }
</style>

---

# The same query, twice

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1em;">
<div>

```ts
// main.ts
import { VueQueryPlugin } from '@tanstack/vue-query';

app.use(VueQueryPlugin);
```

```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const props = defineProps<{ clientId: number }>();

const { data, isPending, isError, error, refetch }
  = useQuery({
  queryKey: ['invoices', toRef(props, 'clientId')],
  queryFn: () =>
    api.get<Invoice[]>(`/clients/${props.clientId}/invoices`),
  staleTime: 30_000,
});
</script>
```

</div>
<div>

```ts
// main.ts
import { PiniaColada } from '@pinia/colada';

app.use(createPinia()).use(PiniaColada);
```

```vue
<script setup lang="ts">
import { useQuery } from '@pinia/colada';

const props = defineProps<{ clientId: number }>();

const { data, status, asyncStatus, error, refresh }
  = useQuery({
  key: () => ['invoices', props.clientId],
  query: () =>
    api.get<Invoice[]>(`/clients/${props.clientId}/invoices`),
  staleTime: 30_000,
});
</script>
```

</div>
</div>

- The key must stay **reactive**: a `ref` inside the array for TanStack, a **getter**
  for Colada — otherwise changing `clientId` never refetches
- Colada splits the two questions: `status` is *do I have data?*
  (`pending` / `success` / `error`), `asyncStatus` is *is a request in flight?*
  (`idle` / `loading`) — TanStack mixes them into `isPending` + `isFetching`
- `refresh()` respects `staleTime`, `refetch()` ignores the cache

<style>
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.4;
}
ul { font-size: 0.78em; }
</style>

---

# Mutating, and invalidating

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1em;">
<div>

```ts
import { useMutation, useQueryClient }
  from '@tanstack/vue-query';

const queryClient = useQueryClient();

const { mutate, isPending } = useMutation({
  mutationFn: (draft: NewInvoice) =>
    api.post<Invoice>('/invoices', draft),
  onSuccess: () =>
    queryClient.invalidateQueries({
      queryKey: ['invoices'],
    }),
});

mutate(draft);
```

</div>
<div>

```ts
import { useMutation, useQueryCache }
  from '@pinia/colada';

const queryCache = useQueryCache();

const { mutate, asyncStatus } = useMutation({
  mutation: (draft: NewInvoice) =>
    api.post<Invoice>('/invoices', draft),
  onSettled: () =>
    queryCache.invalidateQueries({
      key: ['invoices'],
    }),
});

mutate(draft);
```

</div>
</div>

- Invalidation is **prefix-based** on both: `['invoices']` also invalidates
  `['invoices', 42]`. Pass `exact: true` to stop at the parent
- `onSuccess` / `onError` / `onSettled` on both, plus `onMutate` for the optimistic
  update and its rollback
- Nothing to unsubscribe: the cache entry is dropped after `gcTime` once the last
  component using it unmounts

<br />

> Keep the store for what stays on the client — the active filters, the cart, the
> UI — and let the query layer own everything that came over the wire.

<style>
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.4;
}
ul { font-size: 0.8em; }
blockquote { font-size: 0.85em; }
</style>

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

# Quiz — Question 1 / 1

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

