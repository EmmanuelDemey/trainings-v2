<script setup lang="ts">
import IssueList from './components/IssueList.vue';
import OpenCounter from './components/OpenCounter.vue';
</script>

<template>
  <header class="row spread">
    <h1>Issue tracker</h1>
    <OpenCounter />
  </header>
  <p class="muted">
    The counter and the list both show the open issues. Read the
    <strong>Network</strong> panel at the bottom: how many times did the server
    hear about them?
  </p>

  <IssueList />
</template>
