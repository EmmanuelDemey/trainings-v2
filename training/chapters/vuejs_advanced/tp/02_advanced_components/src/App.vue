<script setup lang="ts">
import ChartPanel from './components/ChartPanel.vue';
import ProfilePanel from './components/ProfilePanel.vue';
import InvoiceTablePanel from './components/InvoiceTablePanel.vue';
import BigListPanel from './components/BigListPanel.vue';
</script>

<template>
  <h1>TP 2 — Advanced components</h1>
  <p class="muted">
    Open the Network tab (filter on JS) and the Vue Devtools before you start:
    every step of this workshop is meant to be <em>observed</em>, not just written.
  </p>

  <ChartPanel />
  <ProfilePanel />
  <InvoiceTablePanel />
  <BigListPanel />
</template>
