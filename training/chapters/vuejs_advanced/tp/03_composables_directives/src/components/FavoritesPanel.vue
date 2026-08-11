<script setup lang="ts">
/**
 * A SECOND consumer of `useFavorites`, in a different part of the tree.
 *
 * As long as `useFavorites` creates its state inside the function, this panel
 * and `CatalogPanel` keep two independent lists and disagree — that is the bug
 * TODO 3.2 asks you to fix.
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
      Open a second tab: it should follow along too, once you have done TODO 2.3.
    </p>
  </section>
</template>
