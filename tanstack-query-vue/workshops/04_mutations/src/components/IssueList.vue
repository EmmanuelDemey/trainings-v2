<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { deleteIssue } from '@/api/fakeApi';
import { issuesQuery } from '@/queries/issues';

const { data: issues, isPending, isFetching, error } = useQuery(issuesQuery('open'));

// TODO (step 4) — `useDeleteIssue()`, and disable the row being deleted
// (`isPending` and `variables`). Today the server deletes the issue, and the
// cache never hears of it: the row stays, the counter lies.
function remove(id: number): void {
  deleteIssue(id).catch(() => {
    // Swallowed: nobody tells the user.
  });
}
</script>

<template>
  <section>
    <div class="row spread">
      <h2>Open issues</h2>
      <span v-if="isFetching && !isPending" class="muted" data-testid="list-refreshing">refreshing…</span>
    </div>

    <p v-if="isPending" class="muted" data-testid="list-loading">Loading…</p>
    <p v-else-if="error" class="error" data-testid="list-error">{{ error.message }}</p>
    <ul v-else class="issues">
      <li v-for="issue in issues" :key="issue.id" :data-testid="`issue-${issue.id}`">
        <span>#{{ issue.id }} {{ issue.title }}</span>
        <button type="button" :data-testid="`delete-${issue.id}`" @click="remove(issue.id)">Delete</button>
      </li>
    </ul>
  </section>
</template>
