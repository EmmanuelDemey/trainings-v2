<script setup lang="ts">
import { computed, onUpdated, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useShopStore } from '@/stores/shop';
import { renderStats, countRender } from './renderStats';

const shop = useShopStore();
const { products, status, error, loadDurationMs, search } = storeToRefs(shop);

const size = ref(10_000);

const visible = computed(() => {
  const needle = search.value.toLowerCase();
  return products.value
    .filter((p) => p.name.toLowerCase().includes(needle))
    .slice(0, 50);
});

onUpdated(() => countRender('CatalogPanel'));
</script>

<template>
  <section>
    <h2>2 &amp; 3 — Reactivity cost and indexes</h2>

    <div class="row" style="margin-bottom: 0.75rem">
      <label>
        Catalog size
        <select v-model.number="size" data-testid="size">
          <option :value="500">500</option>
          <option :value="5000">5 000</option>
          <option :value="10000">10 000</option>
          <option :value="30000">30 000</option>
        </select>
      </label>
      <button
        type="button"
        data-testid="load"
        :disabled="status === 'loading'"
        @click="shop.loadProducts(size)"
      >
        {{ status === 'loading' ? 'Loading…' : 'Load catalog' }}
      </button>
      <strong data-testid="load-duration">assignment: {{ loadDurationMs }} ms</strong>
    </div>

    <p v-if="error" class="error" data-testid="catalog-error">{{ error.message }}</p>

    <p class="muted">
      The measured time is the <em>assignment</em> only — that is the cost of
      making the payload reactive, not of the network. Load 30 000 products with
      <code>ref</code>, then with <code>shallowRef</code> (TODO 2.1), and compare.
    </p>

    <input v-model="search" data-testid="search" placeholder="Search a product" />

    <ul class="products">
      <li v-for="product in visible" :key="product.id">
        <span>{{ product.name }}</span>
        <span class="muted">{{ product.price }} €</span>
        <button type="button" :data-testid="`add-${product.id}`" @click="shop.addToCart(product.id)">
          Add
        </button>
      </li>
    </ul>

    <p class="muted">
      {{ products.length }} products loaded — showing the first {{ visible.length }}.
      Re-renders: <strong>{{ renderStats.CatalogPanel }}</strong>
    </p>
  </section>
</template>

<style scoped>
.products { list-style: none; padding: 0; margin: 0.75rem 0 0; max-height: 220px; overflow-y: auto; }
.products li { display: grid; grid-template-columns: 1fr 5rem 4rem; gap: 0.5rem; align-items: center; }
</style>
