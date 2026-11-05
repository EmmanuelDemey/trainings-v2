<script setup lang="ts">
import { ref, watch } from 'vue';
import { keepPreviousData, noop, useQuery, useQueryClient } from '@tanstack/vue-query';
import { issuePageQuery } from '@/queries/issues';

const page = ref(1);
const queryClient = useQueryClient();

const { data, isPending, isPlaceholderData, isFetching, error } = useQuery(() => ({
  ...issuePageQuery(page.value),
  // Page 3 is a new key, so a new query with nothing in it — without this,
  // the table would empty and "Loading…" would flash at every click. With it,
  // `data` keeps the LAST page shown until the new one lands, and
  // `isPlaceholderData` says so.
  placeholderData: keepPreviousData,
}));

// As soon as a page is ON SCREEN, fetch the next one into the cache: the
// click on "Next" then finds it there, and sends nothing. `current.page`, not
// `page.value`: while page 3 is still a placeholder, `data` is page 2 — and
// page 3 is already being fetched.
watch(
  data,
  (current) => {
    if (current && current.page < current.totalPages) {
      // `queryClient.query` respects `staleTime`: a page already fresh in the
      // cache is not fetched again. Nobody awaits it: `.catch(noop)` swallows
      // a failure (replaces `prefetchQuery`, deprecated since 5.104).
      queryClient.query(issuePageQuery(current.page + 1)).catch(noop);
    }
  },
  { immediate: true },
);
</script>

<template>
  <section>
    <div class="row spread">
      <h2>All issues</h2>
      <span v-if="isFetching" class="muted">fetching…</span>
    </div>

    <p v-if="isPending" class="muted" data-testid="issues-loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <table v-else :class="{ dimmed: isPlaceholderData }">
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
      <!-- Disabled while the page on screen is a placeholder: "Next" means
           "after the page I SEE", not after one still on its way. -->
      <button
        type="button"
        data-testid="page-next"
        :disabled="isPlaceholderData || !data || page >= data.totalPages"
        @click="page++"
      >
        Next
      </button>
    </div>
  </section>
</template>
