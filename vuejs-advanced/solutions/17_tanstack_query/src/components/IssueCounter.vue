<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { issuesQuery } from '@/queries/issues';

// Same key as the list's default filter: one request, one cache entry. `select`
// derives the number from the cached list without changing what is cached.
const { data: count } = useQuery({
  ...issuesQuery('open'),
  select: (issues) => issues.length,
});
</script>

<template>
  <span class="badge" data-testid="open-count">
    {{ count ?? '…' }} open
  </span>
</template>
