<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchIssues, type IssueSummary } from '@/api/fakeApi';

// TODO (step 2) — replace the three refs and `onMounted` with
// `useQuery(issuesQuery('open'))`. The list asks for the very same data: with
// the same key, the two components share ONE request.
const openIssues = ref<IssueSummary[]>();
const loading = ref(false);
const error = ref<Error | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    openIssues.value = await fetchIssues('open');
  } catch (caught) {
    error.value = caught as Error;
  } finally {
    loading.value = false;
  }
});

const label = computed(() => (openIssues.value ? `${openIssues.value.length} open` : '… open'));
</script>

<template>
  <span class="badge" data-testid="open-count" :title="error?.message">{{ label }}</span>
</template>
