<script setup lang="ts">
/**
 * STEP 1 — Async component
 *
 * Right now `SalesChart` is imported statically: it ships in the entry chunk and
 * is downloaded even by users who never open this panel.
 *
 * Your job: make it an async component so its code (and its palette payload) is
 * fetched only when the panel is actually shown.
 */
import { ref } from 'vue';

// TODO 1.1: replace this static import with `defineAsyncComponent`.
//   import { defineAsyncComponent } from 'vue';
//   const SalesChart = defineAsyncComponent(() => import('./SalesChart.vue'));
//   Reload with the Network tab open: a new .js chunk must appear on "Show".
import SalesChart from './SalesChart.vue';

// TODO 1.2: switch to the object syntax and add:
//   - `loadingComponent: ChartSkeleton` with `delay: 200`
//     (below 200 ms of loading, no skeleton at all — no spinner flash)
//   - `errorComponent: ChartError` with `timeout: 5000`
//
// TODO 1.3: add an `onError(error, retry, fail, attempts)` handler that retries
//   once on a chunk-loading error, and calls `fail()` otherwise.
//   Test it: in `src/api/fakeApi.ts`, flip `failureSwitch.chart` to `true`.
//
// TODO 1.4 (bonus): throttle your connection to "Slow 3G" in the Network tab and
//   check that the skeleton, then the chart, appear in the right order.

const shown = ref(false);
</script>

<template>
  <section>
    <h2>1 — Async component</h2>
    <p class="muted">
      The chart is heavy and below the fold. It should not cost anything to a user
      who never displays it.
    </p>

    <div class="row">
      <button type="button" data-testid="toggle-chart" @click="shown = !shown">
        {{ shown ? 'Hide' : 'Show' }} the chart
      </button>
      <span class="muted">Watch the Network tab while you click.</span>
    </div>

    <SalesChart v-if="shown" />
  </section>
</template>
