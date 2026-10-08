<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { IssueFilter, IssueSummary } from '@/api/fakeApi';
import { FILTERS, issuesQuery, useToggleIssue } from '@/queries/issues';

const filter = ref<IssueFilter>('open');

const { data: issues, isPending, isFetching, error } = useQuery(() => issuesQuery(filter.value));

// The component only says WHAT changes. How the cache follows — and how it
// comes back — is the composable's business.
const { mutate: setStatus, error: toggleError } = useToggleIssue();

function toggle(issue: IssueSummary): void {
  setStatus({ id: issue.id, status: issue.status === 'open' ? 'closed' : 'open' });
}
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
      <span v-if="isFetching && !isPending" class="muted" data-testid="list-refreshing">refreshing…</span>
    </div>

    <p v-if="toggleError" class="error" data-testid="toggle-error">{{ toggleError.message }}</p>
    <p v-if="isPending" class="muted" data-testid="list-loading">Loading…</p>
    <p v-else-if="error" class="error" data-testid="list-error">{{ error.message }}</p>
    <ul v-else class="issues">
      <li v-for="issue in issues" :key="issue.id" :data-testid="`issue-${issue.id}`">
        <span :class="{ closed: issue.status === 'closed' }">#{{ issue.id }} {{ issue.title }}</span>
        <button type="button" :data-testid="`toggle-${issue.id}`" @click="toggle(issue)">
          {{ issue.status === 'open' ? 'Close' : 'Reopen' }}
        </button>
      </li>
    </ul>
  </section>
</template>
