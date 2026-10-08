<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { activityFirstPageQuery } from '@/queries/activity';

// TODO (step 3) — `useInfiniteQuery(activityFeedQuery())`. It gives you
// `data.pages`, `fetchNextPage`, `hasNextPage` and `isFetchingNextPage`.
const { data, isPending, error } = useQuery(activityFirstPageQuery());

// TODO (step 3) — every event of every page: `data.pages.flatMap(…)`.
const events = computed(() => data.value?.items ?? []);

function loadMore(): void {
  // TODO (step 3) — `fetchNextPage()`. Today, the button does nothing.
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
      <!-- TODO (step 3) — `activity-loading-more` while `isFetchingNextPage`:
           <p class="muted" data-testid="activity-loading-more">Loading more…</p> -->
      <!-- TODO (step 3) — only while `hasNextPage`, and disabled while the
           next page loads. -->
      <button type="button" data-testid="load-more" @click="loadMore">Load more</button>
    </template>
  </section>
</template>
