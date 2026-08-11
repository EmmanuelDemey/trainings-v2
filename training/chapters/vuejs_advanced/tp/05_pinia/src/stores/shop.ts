import { defineStore } from 'pinia';
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
 *   - `productById` is O(n) and is called once per cart line, on every render
 *   - `products` is deeply reactive for 10 000 items that are never mutated
 *   - nothing is persisted
 *   - no HMR: editing this file full-reloads the page and drops your cart
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
    }
  }

  // TODO 3.1: this getter is O(n) and is re-run for EVERY cart line on EVERY
  //   render, because a getter taking an argument cannot be cached.
  //   Replace it with a cached `Map` index:
  //     const byId = computed(() => new Map(products.value.map((p) => [p.id, p])));
  //   and expose `byId` instead. Update the components accordingly.
  const productById = computed(() => (id: number): Product | undefined =>
    products.value.find((p) => p.id === id));

  const categories = computed(() =>
    [...new Set(products.value.map((p) => p.category))].sort());

  // ------------------------------------------------------------------- cart
  const lines = ref<CartLine[]>([]);

  const cartCount = computed(() => lines.value.reduce((n, l) => n + l.qty, 0));

  const cartTotal = computed(() =>
    lines.value.reduce((n, l) => n + (productById.value(l.productId)?.price ?? 0) * l.qty, 0));

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
    products, status, error, loadDurationMs, loadProducts, productById, categories,
    lines, cartCount, cartTotal, addToCart, removeFromCart, clearCart,
    theme, search, toggleTheme,
  };
});

// TODO 5.1: enable Hot Module Replacement on this store (and on every store you
//   extract from it):
//
//   import { acceptHMRUpdate } from 'pinia';
//   if (import.meta.hot) {
//     import.meta.hot.accept(acceptHMRUpdate(useShopStore, import.meta.hot));
//   }
//
//   Check it: add something to the cart, edit a label in this file, and see
//   whether the cart survives.
