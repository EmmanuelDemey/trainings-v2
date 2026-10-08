<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { IssueFilter } from '@/api/fakeApi';
import { issuesQuery } from '@/queries/issues';

defineProps<{ selectedId: number | undefined }>();
const emit = defineEmits<{ select: [id: number] }>();

const FILTERS: IssueFilter[] = ['open', 'closed', 'all'];
const filter = ref<IssueFilter>('open');

// A GETTER, not an object: `useQuery` runs it inside a `computed`, so reading
// `filter.value` in it is tracked — a new filter, a new key, a new query.
// `useQuery(issuesQuery(filter.value))` would read the filter ONCE, during
// setup, and show the open issues forever.
//
// No race either: each filter has its own entry in the cache, and the list
// shows the entry of the CURRENT key — a slow answer for an old filter lands
// in its own entry, never on screen.
const { data: issues, isPending, isFetching, error } = useQuery(() => issuesQuery(filter.value));
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
      <!-- `isFetching`: a request is in flight, data on screen or not. Shown
           only BEHIND data — before that, "Loading…" says it already. -->
      <span v-if="isFetching && !isPending" class="muted" data-testid="list-refreshing">refreshing…</span>
    </div>

    <!-- `isPending`: nothing to show yet, for THIS key. A filter already in the
         cache is never pending again, even while it is refetched. -->
    <p v-if="isPending" class="muted" data-testid="list-loading">Loading…</p>
    <p v-else-if="error" class="error" data-testid="list-error">{{ error.message }}</p>
    <ul v-else class="issues">
      <li
        v-for="issue in issues"
        :key="issue.id"
        :class="{ selected: issue.id === selectedId }"
        :data-testid="`issue-${issue.id}`"
      >
        <span :class="{ closed: issue.status === 'closed' }">#{{ issue.id }} {{ issue.title }}</span>
        <button type="button" :data-testid="`select-${issue.id}`" @click="emit('select', issue.id)">Details</button>
      </li>
    </ul>
  </section>
</template>
