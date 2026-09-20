<script setup lang="ts">
/**
 * A Pinia-connected component. Step 4 tests it with `createTestingPinia`:
 * seeded state, spied actions, no real store logic running.
 */
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
const { lines, count, total } = storeToRefs(cart);
</script>

<template>
  <section data-testid="cart-summary">
    <h2>Cart</h2>

    <p data-testid="count">{{ count }} item(s)</p>
    <p data-testid="total">{{ total.toFixed(2) }} €</p>

    <ul>
      <li v-for="line in lines" :key="line.id" :data-testid="`line-${line.id}`">
        {{ line.label }} × {{ line.qty }}
        <button type="button" :data-testid="`remove-${line.id}`" @click="cart.remove(line.id)">
          Remove
        </button>
      </li>
    </ul>

    <button type="button" data-testid="clear" :disabled="count === 0" @click="cart.clear()">
      Clear the cart
    </button>
  </section>
</template>
