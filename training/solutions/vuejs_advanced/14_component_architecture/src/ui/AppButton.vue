<script setup lang="ts">
/**
 * A button. Could this file be copied into a different product? Now, yes.
 *
 * The invoice count it used to fetch from a store is the caller's to pass — and
 * the caller already had it.
 */
defineProps<{ variant?: 'primary' | 'ghost' }>();
</script>

<template>
  <button type="button" data-testid="app-button" :data-variant="variant ?? 'primary'">
    <slot />
  </button>
</template>
