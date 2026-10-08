<script setup lang="ts">
/**
 * `src/components/ui/Button.vue`. With `directoryAsNamespace: true` this is
 * `<UiButton>` in any template — no import, and still a real generated
 * `import`, so it tree-shakes. `app.component()` never does.
 */
defineProps<{ variant?: 'primary' | 'ghost' }>();
</script>

<template>
  <button type="button" data-testid="ui-button" :data-variant="variant ?? 'primary'">
    <slot />
  </button>
</template>
