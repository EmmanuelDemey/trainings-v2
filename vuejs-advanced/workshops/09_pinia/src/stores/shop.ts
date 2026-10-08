import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { fetchProducts, type Product } from '@/api/fakeApi';

export interface CartLine {
  productId: number;
  qty: number;
}

/**
 * STEP 1 — The god store.
 *
 * Everything lives here: the catalog, the cart, and the UI state. It works, and
 * it is exactly what a real project looks like after eighteen months.
 *
 * Problems to find and fix:
 *   - a component reading `theme` re-renders when the CATALOG changes
 *   - `products` is deeply reactive for 10 000 items that are never mutated
 *   - nothing is persisted, and nothing is observed
 *
 * TODO 1.1: split this store into three: `useCatalogStore`, `useCartStore` and
 *   `useUiStore`, in three files. `useCartStore` reads the catalog by calling
 *   `useCatalogStore()` INSIDE its setup function.
 *
 * TODO 1.2: keep the same public API from the components' point of view, so the
 *   app keeps working while you refactor. Update the imports as you go.
 */
export const useShopStore = defineStore('shop', () => {
  // ---------------------------------------------------------------- catalog
  // TODO 2.1: this array is replaced wholesale and never mutated in place.
  //   Switch it to `shallowRef` and compare the "load" timing displayed in the
  //   catalog panel, for 10 000 products.
  const products = ref<Product[]>([]);
  const status = ref<'idle' | 'loading' | 'error'>('idle');
  const error = ref<Error | null>(null);
  const loadDurationMs = ref(0);

  async function loadProducts(count: number): Promise<void> {
    status.value = 'loading';
    error.value = null;
    try {
      const fetched = await fetchProducts(count);
      const start = performance.now();
      products.value = fetched;                    // the assignment is what costs
      loadDurationMs.value = Math.round(performance.now() - start);
      status.value = 'idle';
    } catch (e) {
      error.value = e as Error;
      status.value = 'error';
      // TODO 4.4: rethrow here. `$onAction`'s `onError` only fires when the
      //   action actually rejects, so an error swallowed at this line is an
      //   error your logger can never record — and the DoD box about failed
      //   actions stays out of reach.
    }
  }

  // Already done for you: an index, not a getter with an argument. A getter
  //   returning `(id) => products.find(...)` caches the function, never the
  //   lookup — O(n) per cart line, on every render. A `computed` holding a `Map`
  //   is rebuilt only when `products` changes, and each lookup is O(1).
  const byId = computed(() => new Map(products.value.map((p) => [p.id, p])));

  const categories = computed(() =>
    [...new Set(products.value.map((p) => p.category))].sort());

  // ------------------------------------------------------------------- cart
  const lines = ref<CartLine[]>([]);

  const cartCount = computed(() => lines.value.reduce((n, l) => n + l.qty, 0));

  const cartTotal = computed(() =>
    lines.value.reduce((n, l) => n + (byId.value.get(l.productId)?.price ?? 0) * l.qty, 0));

  function addToCart(productId: number): void {
    const line = lines.value.find((l) => l.productId === productId);
    if (line) line.qty += 1;
    else lines.value.push({ productId, qty: 1 });
  }

  function removeFromCart(productId: number): void {
    lines.value = lines.value.filter((l) => l.productId !== productId);
  }

  function clearCart(): void {
    lines.value = [];
  }

  // --------------------------------------------------------------------- ui
  const theme = ref<'light' | 'dark'>('light');
  const search = ref('');

  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  return {
    products, status, error, loadDurationMs, loadProducts, byId, categories,
    lines, cartCount, cartTotal, addToCart, removeFromCart, clearCart,
    theme, search, toggleTheme,
  };
});

// Already done for you: Hot Module Replacement. Editing this file swaps the
//   store in place instead of reloading the page — the cart survives. Every
//   store you extract needs its own copy of these three lines.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useShopStore, import.meta.hot));
}
