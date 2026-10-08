<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import { fetchIssues, setIssueStatus, type Issue, type IssueFilter } from '@/api/fakeApi';
import NewIssueForm from './NewIssueForm.vue';

const FILTERS: IssueFilter[] = ['open', 'closed', 'all'];
const filter = ref<IssueFilter>('open');

// TODO 2.1 — the four refs and `load()` below are what `useQuery` gives you for
// free: `data`, `isPending`, `isFetching`, `error`. Replace them with
// `useQuery(() => issuesQuery(filter.value))` — a GETTER, so that the key
// follows the filter.
const issues = shallowRef<Issue[]>([]);
const loading = ref(false);
const loadError = ref<Error | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  loadError.value = null;
  try {
    issues.value = await fetchIssues(filter.value);
  } catch (e) {
    loadError.value = e as Error;
  } finally {
    loading.value = false;
  }
}

watch(filter, load, { immediate: true });

// TODO 4.2 — replace with `useSetIssueStatus()`. The list must move the moment
// you click, not 400 ms later.
const toggleError = ref<Error | null>(null);
const pendingId = ref<number | null>(null);

async function toggle(issue: Issue): Promise<void> {
  toggleError.value = null;
  pendingId.value = issue.id;
  try {
    await setIssueStatus(issue.id, issue.status === 'open' ? 'closed' : 'open');
    await load();
  } catch (e) {
    toggleError.value = e as Error;
  } finally {
    pendingId.value = null;
  }
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
      <span v-if="loading" class="muted" data-testid="fetching">refreshing…</span>
    </div>

    <p v-if="loadError" class="error">{{ loadError.message }}</p>
    <p v-if="toggleError" class="error" data-testid="toggle-error">{{ toggleError.message }}</p>

    <p v-if="loading && issues.length === 0" class="muted">Loading…</p>
    <ul v-else class="issues">
      <li v-for="issue in issues" :key="issue.id" :data-testid="`issue-${issue.id}`">
        <span :class="{ closed: issue.status === 'closed' }">#{{ issue.id }} {{ issue.title }}</span>
        <button
          type="button"
          :data-testid="`toggle-${issue.id}`"
          :disabled="pendingId === issue.id"
          @click="toggle(issue)"
        >
          {{ issue.status === 'open' ? 'Close' : 'Reopen' }}
        </button>
      </li>
    </ul>

    <!-- TODO 3.3 — once `NewIssueForm` invalidates the cache itself, this list
         no longer has to be told: drop the `@created` listener. -->
    <NewIssueForm @created="load" />
  </section>
</template>

<style scoped>
.issues { list-style: none; padding: 0; margin: 0.75rem 0; }
.issues li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.35rem 0; border-bottom: 1px solid var(--border); }
.closed { text-decoration: line-through; color: var(--muted); }
[aria-selected='true'] { border-color: var(--accent); font-weight: 600; }
</style>
