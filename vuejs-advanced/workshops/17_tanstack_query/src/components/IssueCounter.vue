<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchIssues } from '@/api/fakeApi';

// TODO 1.4 — replace this hand-rolled fetch with `useQuery(issuesQuery('open'))`,
// and a `select` that turns the cached list into its length. Same key as the
// list's default filter: the two components share ONE request and ONE cache
// entry.
const count = ref<number | null>(null);

onMounted(async () => {
  count.value = (await fetchIssues('open')).length;
});
</script>

<template>
  <span class="badge" data-testid="open-count">
    {{ count ?? '…' }} open
  </span>
</template>
