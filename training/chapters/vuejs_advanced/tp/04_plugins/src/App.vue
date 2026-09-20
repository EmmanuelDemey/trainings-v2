<script setup lang="ts">
/**
 * TODO 7b (last step): once `ToastHost` is registered globally by `install()`
 *   and declared in `augmentations.d.ts`, delete this import. A consumer of the
 *   plugin should never have to know the host component exists.
 */
import ToastHost from './plugins/toast/ToastHost.vue';
import CheckoutPanel from './components/CheckoutPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
</script>

<template>
  <h1>Toast plugin</h1>

  <CheckoutPanel />
  <SettingsPanel />

  <ToastHost />
</template>
