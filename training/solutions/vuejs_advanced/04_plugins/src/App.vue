<script setup lang="ts">
/**
 * No import of `ToastHost`: `install()` registered it globally, and
 * `augmentations.d.ts` told `vue-tsc` about it. A consumer of the plugin does
 * not have to know the host component exists.
 */
import CheckoutPanel from './components/CheckoutPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
</script>

<template>
  <h1>Toast plugin</h1>

  <CheckoutPanel />
  <SettingsPanel />

  <ToastHost />
</template>
