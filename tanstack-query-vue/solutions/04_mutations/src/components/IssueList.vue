<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { issuesQuery, useDeleteIssue } from '@/queries/issues';

const { data: issues, isPending, isFetching, error } = useQuery(issuesQuery('open'));

// One mutation for the whole list. `variables` is what the LAST `mutate()`
// received: the id being deleted, to disable that row only.
const { mutate: remove, isPending: isDeleting, variables: deletingId, error: deleteError } = useDeleteIssue();
</script>

<template>
  <section>
    <div class="row spread">
      <h2>Open issues</h2>
      <span v-if="isFetching && !isPending" class="muted" data-testid="list-refreshing">refreshing…</span>
    </div>

    <p v-if="deleteError" class="error">{{ deleteError.message }}</p>
    <p v-if="isPending" class="muted" data-testid="list-loading">Loading…</p>
    <p v-else-if="error" class="error" data-testid="list-error">{{ error.message }}</p>
    <ul v-else class="issues">
      <li v-for="issue in issues" :key="issue.id" :data-testid="`issue-${issue.id}`">
        <span>#{{ issue.id }} {{ issue.title }}</span>
        <button
          type="button"
          :data-testid="`delete-${issue.id}`"
          :disabled="isDeleting && deletingId === issue.id"
          @click="remove(issue.id)"
        >
          Delete
        </button>
      </li>
    </ul>
  </section>
</template>
