<script setup lang="ts">
import IssueCounter from './components/IssueCounter.vue';
import IssueList from './components/IssueList.vue';
import NetworkPanel from './components/NetworkPanel.vue';
</script>

<template>
  <header class="row">
    <h1>TP 17 — TanStack Query</h1>
    <IssueCounter />
  </header>
  <p class="muted">
    Keep an eye on the <strong>Network</strong> panel at the bottom: every step
    here is judged on the requests the app sends, and on whether the counter in
    the header tells the truth.
  </p>

  <IssueList />
  <NetworkPanel />
</template>
