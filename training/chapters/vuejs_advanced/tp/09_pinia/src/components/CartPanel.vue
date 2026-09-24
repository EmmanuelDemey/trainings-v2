<script setup lang="ts">
/**
 * Each line costs ONE `Map.get` instead of a `find` over the whole catalog.
 * With 30 000 products and 10 lines that is 10 lookups instead of 300 000
 * comparisons — and the `Map` itself is rebuilt only when the catalog changes,
 * not on every render.
 */
import { onUpdated, ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useShopStore } from '@/stores/shop';
import { renderStats, countRender } from './renderStats';

const shop = useShopStore();
const { lines, cartCount, cartTotal } = storeToRefs(shop);

const lastRenderMs = ref(0);

async function measure(fn: () => void): Promise<void> {
  const start = performance.now();
  fn();
  await nextTick();
  lastRenderMs.value = Math.round((performance.now() - start) * 100) / 100;
}

onUpdated(() => countRender('CartPanel'));
</script>

<template>
  <section>
    <h2>Cart</h2>

    <div class="row" style="margin-bottom: 0.75rem">
      <strong data-testid="cart-count">{{ cartCount }} item(s)</strong>
      <strong data-testid="cart-total">{{ cartTotal.toFixed(2) }} €</strong>
      <span class="muted">last update: {{ lastRenderMs }} ms</span>
      <button type="button" data-testid="clear-cart" @click="measure(() => shop.clearCart())">
        Clear
      </button>
    </div>

    <p v-if="lines.length === 0" class="muted">
      Empty. Add a few products above, then load a 30 000-product catalog and add
      more: the update time is dominated by the O(n) lookup, not by the rendering.
    </p>

    <ul v-else class="lines">
      <li v-for="line in lines" :key="line.productId">
        <span>{{ shop.byId.get(line.productId)?.name ?? `#${line.productId}` }}</span>
        <span class="muted">× {{ line.qty }}</span>
        <button
          type="button"
          :data-testid="`remove-${line.productId}`"
          @click="measure(() => shop.removeFromCart(line.productId))"
        >
          Remove
        </button>
      </li>
    </ul>

    <p class="muted">
      <!-- Counter disabled — see the note in ThemePanel.vue; counts go to the console. -->
      <!-- Re-renders: <strong>{{ renderStats.CartPanel }}</strong> — -->
      The cart must survive a reload once the persistence plugin works (TODO 3).
    </p>
  </section>
</template>

<style scoped>
.lines { list-style: none; padding: 0; margin: 0; }
.lines li { display: grid; grid-template-columns: 1fr 4rem 6rem; gap: 0.5rem; align-items: center; }
</style>
