<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatPrice, type Book } from '../books';

const props = defineProps<{ lines: { book: Book; quantity: number }[] }>();
const emit = defineEmits<{ remove: [isbn: string]; checkout: [coupon: string | null] }>();

const coupon = ref('');
const total = computed(() => props.lines.reduce((sum, { book, quantity }) => sum + book.priceInCents * quantity, 0));
</script>

<template>
  <aside aria-label="Cart">
    <h2>Cart</h2>
    <p v-if="lines.length === 0">Your cart is empty.</p>
    <ul v-else>
      <li v-for="{ book, quantity } in lines" :key="book.isbn">
        {{ quantity }} × {{ book.title }} — {{ formatPrice(book.priceInCents * quantity) }}
        <button type="button" @click="emit('remove', book.isbn)">Remove “{{ book.title }}”</button>
      </li>
    </ul>
    <p>Total: <strong>{{ formatPrice(total) }}</strong></p>
    <form @submit.prevent="emit('checkout', coupon.trim() || null)">
      <label>
        Coupon
        <input v-model="coupon" />
      </label>
      <button type="submit" :disabled="lines.length === 0">Checkout</button>
    </form>
  </aside>
</template>
