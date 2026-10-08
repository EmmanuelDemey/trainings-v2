<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchIssues, type IssueFilter, type IssueSummary } from '@/api/fakeApi';

const FILTERS: IssueFilter[] = ['open', 'closed', 'all'];
const filter = ref<IssueFilter>('open');

// TODO (step 2) — replace these three refs and `load()` with `useQuery`.
// TODO (step 3) — …with a GETTER, `() => issuesQuery(filter.value)`, so the key
// follows the filter.
const issues = ref<IssueSummary[]>();
const loading = ref(false);
const error = ref<Error | null>(null);

// Three bugs, all visible in the Network panel:
// - this list and the header counter each send `GET /issues?status=open`;
// - coming back to a filter forgets what it had: "Loading…" again;
// - nothing tells an old answer from the current one — with a slow server, the
//   answer for the filter you LEFT can land last, and stay on screen.
async function load(current: IssueFilter): Promise<void> {
  loading.value = true;
  issues.value = undefined;
  error.value = null;
  try {
    issues.value = await fetchIssues(current);
  } catch (caught) {
    error.value = caught as Error;
  } finally {
    loading.value = false;
  }
}

watch(filter, load, { immediate: true });
</script>

<template>
  <section>
    <div class="row spread">
      <div class="row">
        <button
          v-for="option in FILTERS"
          :key="option"
          type="button"
          :aria-pressed="filter === option"
          :data-testid="`filter-${option}`"
          @click="filter = option"
        >
          {{ option }}
        </button>
      </div>
      <!-- TODO (step 4) — `list-refreshing`, while a request is in flight BEHIND
           data already on screen (`isFetching && !isPending`):
           <span class="muted" data-testid="list-refreshing">refreshing…</span> -->
    </div>

    <!-- TODO (step 4) — `isPending`, not "a request is in flight". -->
    <p v-if="loading" class="muted" data-testid="list-loading">Loading…</p>
    <p v-else-if="error" class="error" data-testid="list-error">{{ error.message }}</p>
    <ul v-else class="issues">
      <li v-for="issue in issues" :key="issue.id" :data-testid="`issue-${issue.id}`">
        <span :class="{ closed: issue.status === 'closed' }">#{{ issue.id }} {{ issue.title }}</span>
        <span class="muted">{{ issue.assignee ?? 'unassigned' }}</span>
      </li>
    </ul>
  </section>
</template>
