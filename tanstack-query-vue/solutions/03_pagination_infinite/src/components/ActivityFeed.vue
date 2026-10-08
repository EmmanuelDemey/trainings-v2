<script setup lang="ts">
import { computed } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { activityFeedQuery } from '@/queries/activity';

const { data, isPending, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
  useInfiniteQuery(activityFeedQuery());

// The cache holds pages; the template wants events.
const events = computed(() => data.value?.pages.flatMap((page) => page.items) ?? []);

// `fetchNextPage` is a plain function, not a ref: call it, no `.value`.
function loadMore(): void {
  void fetchNextPage();
}
</script>

<template>
  <section>
    <h2>Activity</h2>
    <p v-if="isPending" class="muted">Loading…</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <template v-else>
      <ul class="feed">
        <li v-for="event in events" :key="event.id" :data-testid="`activity-${event.id}`">
          {{ event.message }}
          <time class="muted" :datetime="event.at">{{ new Date(event.at).toLocaleString() }}</time>
        </li>
      </ul>
      <p v-if="isFetchingNextPage" class="muted" data-testid="activity-loading-more">Loading more…</p>
      <!-- Absent, not disabled, once the last page is in: nothing to promise. -->
      <button v-if="hasNextPage" type="button" data-testid="load-more" :disabled="isFetchingNextPage" @click="loadMore">
        Load more
      </button>
    </template>
  </section>
</template>
