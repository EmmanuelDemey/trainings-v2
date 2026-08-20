import { reactive } from 'vue';

/**
 * Counts how many rows actually re-rendered since the last `reset()`.
 * This is the number the optimizations of step 4 are supposed to bring down.
 */
export const renderStats = reactive({
  updates: 0,
  lastDurationMs: 0,
});

export function reset(): void {
  renderStats.updates = 0;
  renderStats.lastDurationMs = 0;
}
