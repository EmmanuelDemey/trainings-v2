<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { issuesQuery } from '@/queries/issues';

// The same options as the list's "open" filter, so the same key: whichever
// component mounts first sends the request, the other one subscribes to it.
// A plain object is enough here — nothing in it ever changes.
const { data: openIssues } = useQuery(issuesQuery('open'));

// `data` is a ref: unwrapped in the template, `.value` in the script.
const label = computed(() => (openIssues.value ? `${openIssues.value.length} open` : '… open'));
</script>

<template>
  <span class="badge" data-testid="open-count">{{ label }}</span>
</template>
