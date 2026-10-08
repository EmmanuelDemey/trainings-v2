<script setup lang="ts">
/** `[...path].vue` → `/:path(.*)`, the catch-all. */
const route = useRoute('/[...path]');
</script>

<template>
  <section>
    <h2 data-testid="not-found">Not found</h2>
    <p class="muted">No page at <code>{{ route.params.path }}</code>.</p>
  </section>
</template>
