<script setup lang="ts">
import { ref } from 'vue';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import type { Issue, IssueFilter } from '@/api/fakeApi';
import { issuesQuery, useSetIssueStatus } from '@/queries/issues';
import NewIssueForm from './NewIssueForm.vue';

const FILTERS: IssueFilter[] = ['open', 'closed', 'all'];
const filter = ref<IssueFilter>('open');

// A getter: `filter.value` is read inside it, so the key follows the filter.
// `issuesQuery(filter.value)` at the top level would read it ONCE.
const { data: issues, isPending, isFetching, error: loadError } = useQuery(() => ({
  ...issuesQuery(filter.value),
  // While a filter never loaded before is on its way, keep showing the
  // previous list rather than an empty page.
  placeholderData: keepPreviousData,
}));

const { mutate: setStatus, error: toggleError } = useSetIssueStatus();

function toggle(issue: Issue): void {
  setStatus({ id: issue.id, status: issue.status === 'open' ? 'closed' : 'open' });
}
</script>

<template>
  <section>
    <h2>Issues</h2>

    <div class="row" role="tablist">
      <button
        v-for="option in FILTERS"
        :key="option"
        type="button"
        role="tab"
        :aria-selected="filter === option"
        :data-testid="`filter-${option}`"
        @click="filter = option"
      >
        {{ option }}
      </button>
      <span v-if="isFetching" class="muted" data-testid="fetching">refreshing…</span>
    </div>

    <p v-if="loadError" class="error">{{ loadError.message }}</p>
    <p v-if="toggleError" class="error" data-testid="toggle-error">{{ toggleError.message }}</p>

    <p v-if="isPending" class="muted">Loading…</p>
    <ul v-else class="issues">
      <li v-for="issue in issues" :key="issue.id" :data-testid="`issue-${issue.id}`">
        <span :class="{ closed: issue.status === 'closed' }">#{{ issue.id }} {{ issue.title }}</span>
        <button type="button" :data-testid="`toggle-${issue.id}`" @click="toggle(issue)">
          {{ issue.status === 'open' ? 'Close' : 'Reopen' }}
        </button>
      </li>
    </ul>

    <NewIssueForm />
  </section>
</template>

<style scoped>
.issues { list-style: none; padding: 0; margin: 0.75rem 0; }
.issues li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.35rem 0; border-bottom: 1px solid var(--border); }
.closed { text-decoration: line-through; color: var(--muted); }
[aria-selected='true'] { border-color: var(--accent); font-weight: 600; }
</style>
