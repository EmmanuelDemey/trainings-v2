<script setup lang="ts">
import ActivityFeed from './components/ActivityFeed.vue';
import IssuesTable from './components/IssuesTable.vue';
</script>

<template>
  <header class="row spread">
    <h1>Issue tracker</h1>
  </header>
  <p class="muted">
    Page through the issues, load more activity — and watch the
    <strong>Network</strong> panel: which request leaves when, and which never
    leaves twice.
  </p>

  <div class="layout">
    <IssuesTable />
    <ActivityFeed />
  </div>
</template>
