<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <section>
    <h2>404 — Not found</h2>
    <p class="muted" data-testid="not-found">No route matches <code>{{ route.fullPath }}</code>.</p>
  </section>
</template>
