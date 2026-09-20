<script setup lang="ts">
/**
 * Same story: written, never routed. It should catch everything, and read the
 * unmatched path back out of the route params.
 */
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <section>
    <h2 data-testid="not-found">Not found</h2>
    <p class="muted">No page at <code>{{ route.params.path }}</code>.</p>
  </section>
</template>
