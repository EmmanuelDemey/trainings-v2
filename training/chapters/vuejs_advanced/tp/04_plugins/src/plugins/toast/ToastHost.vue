<script setup lang="ts">
/**
 * The plugin's own component, registered globally by `install()` so a consumer
 * never imports it. Nothing to change here.
 */
import { useToast } from './useToast';

const toast = useToast();
</script>

<template>
  <div v-if="toast.toasts.value.length > 0" class="toast-host" :data-position="toast.position">
    <output
      v-for="item in toast.toasts.value"
      :key="item.id"
      class="toast"
      :data-level="item.level"
      data-testid="toast"
    >
      {{ item.message }}
      <button
        type="button"
        aria-label="Dismiss"
        data-testid="dismiss-toast"
        @click="toast.dismiss(item.id)"
      >
        ×
      </button>
    </output>
  </div>
</template>
