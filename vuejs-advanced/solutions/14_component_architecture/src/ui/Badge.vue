<script setup lang="ts">
/**
 * Back to what it always was: a coloured label.
 *
 * One `tone`, one slot, no domain type. The **caller** maps its own status or
 * method to a tone, which is why invoicing and payments can disagree about what
 * "success" means without this file ever knowing.
 *
 * The eight props it used to have were eight callers refusing to make that
 * mapping themselves.
 */
defineProps<{ tone?: 'neutral' | 'info' | 'success' | 'danger' }>();
</script>

<template>
  <span class="badge" data-testid="badge" :data-tone="tone ?? 'neutral'">
    <slot />
  </span>
</template>
