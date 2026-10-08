<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { issuesQuery } from '@/queries/issues';

const { data: openCount } = useQuery({
  ...issuesQuery('open'),
  // Other users close issues too. With `staleTime: 30_000`, a FRESH query is
  // not refetched when the tab gets the focus back — `true` means "if stale".
  // `'always'` refetches the counter on every return to the tab, whatever its
  // age. An option of THIS observer: the list, on the same key, keeps `true`.
  refetchOnWindowFocus: 'always',
  // (Bonus) The cache keeps the whole list — the list component needs it.
  // This component only ever sees a number: when a refetch brings the same
  // count, the selected value is the same, and the badge does not re-render.
  select: (issues) => issues.length,
});
</script>

<template>
  <span class="badge" data-testid="open-count">{{ openCount ?? '…' }} open</span>
</template>
