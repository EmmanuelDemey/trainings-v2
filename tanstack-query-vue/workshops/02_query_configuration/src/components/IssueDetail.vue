<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { issueQuery } from '@/queries/issues';

const props = defineProps<{ issueId: number | undefined }>();

// Two bugs, both in the Network panel:
// - nothing is selected on load, yet `GET /issues/undefined` leaves (and fails,
//   and is retried): the query runs whatever the selection;
// - select an issue: the panel stays empty for a full round trip, though the
//   list on its left already knows the title.
//
// TODO (step 2) — no request while nothing is selected (`skipToken` in
// `issueQuery`, or `enabled`).
// TODO (step 3) — `placeholderData`: the summary of the issue, found in the
// cached lists (`queryClient.getQueriesData({ queryKey: issueKeys.lists() })`).
// Show `detail-description` only once the REAL detail arrived
// (`isPlaceholderData`).
const { data: issue, error } = useQuery(() => issueQuery(props.issueId as number));
</script>

<template>
  <section>
    <h2>Detail</h2>
    <p v-if="issueId === undefined" class="muted" data-testid="detail-empty">Select an issue to see its description.</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <p v-else-if="!issue" class="muted">Loading…</p>
    <template v-else>
      <h3 data-testid="detail-title">#{{ issue.id }} {{ issue.title }}</h3>
      <p class="muted">{{ issue.status }} · {{ issue.assignee ?? 'unassigned' }} · {{ issue.commentCount }} comment(s)</p>
      <p data-testid="detail-description">{{ issue.description }}</p>
    </template>
  </section>
</template>
