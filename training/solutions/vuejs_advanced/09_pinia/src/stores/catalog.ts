import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, shallowRef, ref } from 'vue';
import { fetchProducts, type Product } from '@/api/fakeApi';

/**
 * STEP 1 — the catalog, on its own.
 *
 * Splitting is not about tidiness. A component that reads `theme` from a store
 * that also owns 30 000 products subscribes to that store's reactive graph, and
 * re-renders every time the catalog is replaced. Three stores, three
 * subscriptions, three independent invalidations.
 */
export const useCatalogStore = defineStore('catalog', () => {
  /**
   * STEP 2 — `shallowRef`, not `ref`.
   *
   * `ref` walks the whole payload and wraps every object in a Proxy: for 30 000
   * products that assignment costs ~100 ms of pure conversion, before a single
   * pixel is drawn. `shallowRef` only tracks the assignment itself — a few
   * microseconds — and that is all this store ever does with the array.
   *
   * What it breaks: `products.value[0].price = 9` no longer triggers anything.
   * Nothing here mutates a product, which is exactly why the trade is free.
   * If you did need per-item mutation, the answer is not to go back to `ref`
   * (you would pay the conversion for 30 000 items to make one of them
   * reactive) — it is to replace the item:
   *   products.value = products.value.with(0, { ...products.value[0], price: 9 })
   * or to `triggerRef(products)` after mutating in place.
   */
  const products = shallowRef<Product[]>([]);
  const status = ref<'idle' | 'loading' | 'error'>('idle');
  const error = ref<Error | null>(null);
  const loadDurationMs = ref(0);

  /**
   * STEP 3 — an index, not a getter with an argument.
   *
   * `productById(id)` was a getter RETURNING a function: Vue caches the
   * function, never the lookup. Ten cart lines × 30 000 products = 300 000
   * comparisons, on every render.
   *
   * A `computed` holding a `Map` is cached like any other getter: the Map is
   * rebuilt only when `products` changes, and each lookup is O(1).
   */
  const byId = computed(() => new Map(products.value.map((product) => [product.id, product])));

  const categories = computed(() => [...new Set(products.value.map((p) => p.category))].sort());

  async function loadProducts(count: number): Promise<void> {
    status.value = 'loading';
    error.value = null;
    try {
      const fetched = await fetchProducts(count);
      const start = performance.now();
      products.value = fetched; // the assignment is what costs
      loadDurationMs.value = Math.round(performance.now() - start);
      status.value = 'idle';
    } catch (e) {
      error.value = e as Error;
      status.value = 'error';
      throw e; // let the logger plugin's `onError` see it
    }
  }

  return { products, status, error, loadDurationMs, byId, categories, loadProducts };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCatalogStore, import.meta.hot));
}
