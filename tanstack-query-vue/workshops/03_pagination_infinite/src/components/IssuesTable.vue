<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { issuePageQuery } from '@/queries/issues';

const page = ref(1);

// Every page is its own key — so every click on "Next" starts from an EMPTY
// query: `isPending` again, the table disappears, "Loading…" flashes.
//
// TODO (step 1) — `placeholderData: keepPreviousData`, and dim the table /
// disable "Next" while `isPlaceholderData`.
// TODO (step 2) — once a page is on screen, prefetch the next one with
// `queryClient.prefetchQuery(issuePageQuery(n + 1))` (a `watch` on `data`).
const { data, isPending, isFetching, error } = useQuery(() => issuePageQuery(page.value));
</script>

<template>
  <section>
    <div class="row spread">
      <h2>All issues</h2>
      <span v-if="isFetching" class="muted">fetching…</span>
    </div>

    <p v-if="isPending" class="muted" data-testid="issues-loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <table v-else>
      <tbody>
        <tr v-for="issue in data?.items" :key="issue.id" :data-testid="`issue-${issue.id}`">
          <td>#{{ issue.id }}</td>
          <td :class="{ closed: issue.status === 'closed' }">{{ issue.title }}</td>
          <td class="muted">{{ issue.assignee ?? 'unassigned' }}</td>
        </tr>
      </tbody>
    </table>

    <div class="row">
      <button type="button" data-testid="page-prev" :disabled="page === 1" @click="page = Math.max(1, page - 1)">
        Previous
      </button>
      <span data-testid="page-indicator">Page {{ data?.page ?? page }} / {{ data?.totalPages ?? '…' }}</span>
      <button type="button" data-testid="page-next" :disabled="!data || page >= data.totalPages" @click="page++">
        Next
      </button>
    </div>
  </section>
</template>
