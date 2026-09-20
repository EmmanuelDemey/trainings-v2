<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';

const cart = useCartStore();
const auth = useAuthStore();

const catalog = [
  { id: 1, label: 'Espresso machine', price: 249 },
  { id: 2, label: 'Chef knife', price: 89 },
  { id: 3, label: 'Cast-iron pan', price: 64 },
];
</script>

<template>
  <section>
    <h2>Catalog</h2>

    <p class="muted" data-testid="auth-state">
      {{ auth.isAuthenticated ? `Signed in as ${auth.user?.name}` : 'Anonymous' }}
    </p>

    <ul>
      <li v-for="product in catalog" :key="product.id">
        {{ product.label }} — {{ product.price }} €
        <button type="button" :data-testid="`add-${product.id}`" @click="cart.add(product)">
          Add to cart
        </button>
      </li>
    </ul>

    <p data-testid="cart-count">{{ cart.count }} item(s) in the cart</p>
  </section>
</template>
