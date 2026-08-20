<script setup lang="ts">
/**
 * STEP 1 — Async component
 *
 * `SalesChart` is no longer in the entry chunk: `defineAsyncComponent` wraps a
 * dynamic `import()`, which Vite turns into its own chunk. A user who never
 * clicks "Show" never downloads it.
 */
import { defineAsyncComponent, ref } from 'vue';
import ChartSkeleton from './ChartSkeleton.vue';
import ChartError from './ChartError.vue';

const SalesChart = defineAsyncComponent({
  loader: () => import('./SalesChart.vue'),

  // The two components below are imported STATICALLY on purpose: a skeleton
  // that has to be downloaded before it can be shown is not a skeleton.
  loadingComponent: ChartSkeleton,
  errorComponent: ChartError,

  // `delay` protects against the FLASH: under 200 ms of loading, no skeleton at
  // all. A spinner that appears and disappears in 80 ms is worse than no
  // spinner — it reads as a glitch.
  delay: 200,

  // `timeout` protects against the WAIT: past 5 s the loader is considered
  // failed and `errorComponent` is rendered, instead of a skeleton that spins
  // for ever on a dead network.
  timeout: 5000,

  /**
   * One retry, then give up.
   *
   * A chunk that 404s is the classic case: the user's tab was open across a
   * deploy and the hashed file name no longer exists. Retrying once costs
   * nothing and fixes the transient half; retrying for ever turns a bad deploy
   * into a self-inflicted DDoS.
   */
  onError(error, retry, fail, attempts) {
    if (attempts <= 1 && /dynamically imported module|Failed to fetch/i.test(error.message)) {
      retry();
      return;
    }
    fail();
  },
});

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
