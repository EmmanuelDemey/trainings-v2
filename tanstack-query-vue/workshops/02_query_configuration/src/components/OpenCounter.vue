<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { issuesQuery } from '@/queries/issues';

// The same options as the list's "open" filter, so the same key: whichever
// component mounts first sends the request, the other one subscribes to it.
// A plain object is enough here — nothing in it ever changes.
// TODO (step 4) — other users close issues too. Once `staleTime` is set, a
// fresh query is NOT refetched when the user comes back to the tab: add
// `refetchOnWindowFocus: 'always'` to THIS query (the list keeps the default).
// TODO (bonus) — `select: (issues) => issues.length`: the component only needs
// a number.
const { data: openIssues } = useQuery(issuesQuery('open'));

// `data` is a ref: unwrapped in the template, `.value` in the script.
const label = computed(() => (openIssues.value ? `${openIssues.value.length} open` : '… open'));
</script>

<template>
  <span class="badge" data-testid="open-count">{{ label }}</span>
</template>
