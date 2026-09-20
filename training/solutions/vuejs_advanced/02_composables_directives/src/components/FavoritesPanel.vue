<script setup lang="ts">
/**
 * A SECOND consumer of `useFavorites`, in a different part of the tree.
 *
 * It shares its list with `CatalogPanel` because `useFavorites` keeps its state
 * at module scope. Move that state back inside the function and the two panels
 * quietly start disagreeing — try it once, it is a two-line experiment.
 */
import { useFavorites } from '@/composables/useFavorites';
import { products } from '@/api/fakeApi';

const { ids, count, clear } = useFavorites();

const nameOf = (id: number): string =>
  products.find((p) => p.id === id)?.name ?? `#${id}`;
</script>

<template>
  <section>
    <h2>3 — Shared state</h2>

    <div class="row">
      <strong data-testid="favorites-count">{{ count }} favourite(s)</strong>
      <button type="button" :disabled="count === 0" @click="clear">Clear</button>
    </div>

    <ul>
      <li v-for="id in ids" :key="id">{{ nameOf(id) }}</li>
    </ul>

    <p class="muted">
      Reload the page: the list must survive (that is <code>useLocalStorage</code>).
      Open a second tab: it follows along, through the <code>storage</code> event.
    </p>
  </section>
</template>
