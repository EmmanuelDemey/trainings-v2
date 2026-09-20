<script setup lang="ts">
/**
 * Consumer of `useFetch`. The URL is a COMPUTED: changing the category must
 * re-fetch and abort the previous request, without a single line of glue here.
 */
import { computed, ref } from 'vue';
import { useFetch } from '@/composables/useFetch';
import { useFavorites } from '@/composables/useFavorites';
import { requestLog, type Product } from '@/api/fakeApi';

const category = ref<'all' | 'Coffee' | 'Cookware' | 'Small appliances'>('all');

// A getter, not a plain string: `useFetch` must react to it.
const url = computed(() => `/api/products?category=${encodeURIComponent(category.value)}`);

const { data, error, loading } = useFetch<Product[]>(url);
const favorites = useFavorites();
</script>

<template>
  <section>
    <h2>1 &amp; 3 — useFetch + useFavorites</h2>

    <div class="row" style="margin-bottom: 0.75rem">
      <select v-model="category" v-autofocus data-testid="category">
        <option value="all">All categories</option>
        <option value="Coffee">Coffee</option>
        <option value="Cookware">Cookware</option>
        <option value="Small appliances">Small appliances</option>
      </select>
      <span class="muted">{{ requestLog.length }} requests sent since load</span>
    </div>

    <p v-if="loading" class="muted" data-testid="loading">Loading…</p>
    <p v-else-if="error" class="error" data-testid="error">{{ error.message }}</p>
    <p v-else-if="!data?.length" class="muted">No product.</p>

    <ul v-else class="products">
      <li v-for="product in data" :key="product.id">
        <button
          type="button"
          :aria-pressed="favorites.isFavorite(product.id)"
          @click="favorites.toggle(product.id)"
        >
          {{ favorites.isFavorite(product.id) ? '★' : '☆' }}
        </button>
        <span>{{ product.name }}</span>
        <span class="muted">{{ product.price }} €</span>
      </li>
    </ul>

    <p class="muted">
      Switch categories quickly: only the last request should resolve. Check
      <code>requestLog</code> above and the Network tab — the aborted ones show as
      cancelled.
    </p>
  </section>
</template>

<style scoped>
.products { list-style: none; padding: 0; margin: 0; max-height: 240px; overflow-y: auto; }
.products li { display: grid; grid-template-columns: 3rem 1fr 5rem; align-items: center; gap: 0.5rem; }
.products button { border: none; font-size: 1.1rem; padding: 0.1rem; }
</style>
