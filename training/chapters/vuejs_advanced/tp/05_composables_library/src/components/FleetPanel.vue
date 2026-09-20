<script setup lang="ts">
/**
 * Consumer #2. The selector below is the whole point: an interval a user can
 * change is a **reactive input**, and the poller has to follow it.
 */
import { ref } from 'vue';
import { useAutoRefresh } from '../composables/useAutoRefresh';
import { fetchFleetStatus } from '../api/fakeApi';

const intervalMs = ref(5000);
const movingCount = ref(0);
const polledAt = ref(0);

const { ticks } = useAutoRefresh(() => {
  const status = fetchFleetStatus();
  movingCount.value = status.movingCount;
  polledAt.value = status.polledAt;
});
</script>

<template>
  <section>
    <h2>Live status</h2>
    <div class="row">
      <label>
        Refresh every
        <select v-model.number="intervalMs" data-testid="interval">
          <option :value="1000">1 s</option>
          <option :value="5000">5 s</option>
        </select>
      </label>
      <span class="muted">
        <strong data-testid="ticks">{{ ticks }}</strong> poll(s),
        <strong data-testid="moving">{{ movingCount }}</strong> moving,
        last batch <strong data-testid="polled-at">{{ polledAt }}</strong>
      </span>
    </div>
  </section>
</template>
