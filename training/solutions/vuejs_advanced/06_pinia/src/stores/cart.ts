import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useCatalogStore } from './catalog';

export interface CartLine {
  productId: number;
  qty: number;
}

/**
 * The cart reads the catalog by calling `useCatalogStore()` INSIDE the setup
 * function — never at module scope. At module scope the active Pinia instance
 * does not exist yet, and the call throws (or worse, binds to the wrong
 * instance under SSR, where every request has its own).
 */
export const useCartStore = defineStore(
  'cart',
  () => {
    const catalog = useCatalogStore();

    const lines = ref<CartLine[]>([]);

    const count = computed(() => lines.value.reduce((n, l) => n + l.qty, 0));

    const total = computed(() =>
      lines.value.reduce((n, l) => n + (catalog.byId.get(l.productId)?.price ?? 0) * l.qty, 0),
    );

    /**
     * `$patch` with a function rather than a direct mutation, so the logger
     * plugin's `$subscribe` reports `mutation.type === 'patch function'`
     * instead of `direct`. Try both and watch the console: the type is what
     * tells devtools whether it can group and time-travel the change.
     */
    function addToCart(productId: number): void {
      const store = useCartStore();
      store.$patch((state) => {
        const line = state.lines.find((l) => l.productId === productId);
        if (line) line.qty += 1;
        else state.lines.push({ productId, qty: 1 });
      });
    }

    function removeFromCart(productId: number): void {
      lines.value = lines.value.filter((l) => l.productId !== productId);
    }

    function clearCart(): void {
      lines.value = [];
    }

    return { lines, count, total, addToCart, removeFromCart, clearCart };
  },
  // Only `lines` is persisted. The rest is derived, and persisting a getter is
  // how you end up restoring a total that disagrees with its own cart.
  { persist: { paths: ['lines'] } },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
