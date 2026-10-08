<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { Issue, IssueSummary } from '@/api/fakeApi';
import { issueKeys, issueQuery } from '@/queries/issues';

const props = defineProps<{ issueId: number | undefined }>();

const queryClient = useQueryClient();

/**
 * The list the user just clicked in already knows the title, the status, the
 * assignee — not the description. Whatever list it is in, find its summary.
 */
function summaryFromLists(id: number | undefined): Issue | undefined {
  if (id === undefined) return undefined;
  for (const [, issues] of queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })) {
    const summary = issues?.find((issue) => issue.id === id);
    // A summary is not an Issue: what only the detail knows is left blank,
    // and the template does not show it while `isPlaceholderData` is true.
    if (summary) return { ...summary, description: '', createdAt: '', updatedAt: '' };
  }
  return undefined;
}

// A getter again: `props.issueId` is read inside it, so selecting another
// issue builds another key.
const { data: issue, isPlaceholderData, error } = useQuery(() => ({
  ...issueQuery(props.issueId),
  // `placeholderData`, not `initialData`: a placeholder is shown, never
  // cached, and the query still fetches the real issue at once. `initialData`
  // would be written to the cache as if it came from the server — fresh for
  // 30 s, so the description would never be fetched.
  placeholderData: () => summaryFromLists(props.issueId),
}));
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
      <p v-if="isPlaceholderData" class="muted">Loading the description…</p>
      <p v-else data-testid="detail-description">{{ issue.description }}</p>
    </template>
  </section>
</template>
