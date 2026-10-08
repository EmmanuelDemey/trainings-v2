<script setup lang="ts">
import { ref } from 'vue';
import IssueDetail from './components/IssueDetail.vue';
import IssueList from './components/IssueList.vue';
import OpenCounter from './components/OpenCounter.vue';

// Client state — which issue the user looks at — stays a plain ref. Only what
// the SERVER owns goes through TanStack Query.
const selectedId = ref<number>();
</script>

<template>
  <header class="row spread">
    <h1>Issue tracker</h1>
    <OpenCounter />
  </header>
  <p class="muted">
    Switch filters, select an issue, then leave the tab and come back — and read
    the <strong>Network</strong> panel at the bottom after each move.
  </p>

  <div class="layout">
    <IssueList :selected-id="selectedId" @select="selectedId = $event" />
    <IssueDetail :issue-id="selectedId" />
  </div>
</template>
