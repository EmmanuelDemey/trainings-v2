<script setup lang="ts">
import SearchPanel from './components/SearchPanel.vue';
import FleetPanel from './components/FleetPanel.vue';
import RowsPanel from './components/RowsPanel.vue';
</script>

<template>
  <h1>Fleet dashboard</h1>
  <p class="muted">
    Three panels, three app-local composables. Two of them are the company's
    fourth copy of something; the third should never leave this app.
  </p>

  <SearchPanel />
  <FleetPanel />
  <RowsPanel />
</template>
