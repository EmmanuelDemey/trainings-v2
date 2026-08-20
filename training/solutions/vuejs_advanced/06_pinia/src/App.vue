<script setup lang="ts">
import CatalogPanel from './components/CatalogPanel.vue';
import CartPanel from './components/CartPanel.vue';
import ThemePanel from './components/ThemePanel.vue';
import ActionLogPanel from './components/ActionLogPanel.vue';
</script>

<template>
  <h1>TP 6 — Pinia</h1>
  <p class="muted">
    Open the Vue Devtools on the <strong>Pinia</strong> tab and on the
    <strong>Timeline</strong>. Every step here is judged on what the devtools show,
    not on the code looking nicer.
  </p>

  <ThemePanel />
  <CatalogPanel />
  <CartPanel />
  <ActionLogPanel />
</template>
