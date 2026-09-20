<script setup lang="ts">
/**
 * Consumer #2, migrated. The selector feeds `interval` as a **ref**, so the
 * poller re-schedules on its own — that is what `MaybeRefOrGetter` buys the
 * caller.
 */
import { ref } from 'vue';
import { usePolling } from '../packages/acme';
import { fetchFleetStatus } from '../api/fakeApi';

const intervalMs = ref(5000);
const movingCount = ref(0);
const polledAt = ref(0);

const { ticks, isActive, start, stop } = usePolling(
  () => {
    const status = fetchFleetStatus();
    movingCount.value = status.movingCount;
    polledAt.value = status.polledAt;
  },
  { interval: intervalMs },
);
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
      <button type="button" data-testid="toggle-polling" @click="isActive ? stop() : start()">
        {{ isActive ? 'Pause' : 'Resume' }}
      </button>
      <span class="muted">
        <strong data-testid="ticks">{{ ticks }}</strong> poll(s),
        <strong data-testid="moving">{{ movingCount }}</strong> moving,
        last batch <strong data-testid="polled-at">{{ polledAt }}</strong>
      </span>
    </div>
  </section>
</template>
