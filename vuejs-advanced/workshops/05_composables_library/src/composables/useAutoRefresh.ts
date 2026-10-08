/**
 * Copy #2 of "the poller". Its interval is hardcoded, it cannot be stopped, and
 * `onUnmounted` ties it to a component — call it from a Pinia store and it never
 * cleans up.
 *
 * TODO 6: delete this file and call `usePolling` from `@/packages/acme`
 *   instead, wiring the panel's interval selector to its `interval` option.
 */
import { onUnmounted, ref, type Ref } from 'vue';

export function useAutoRefresh(task: () => void): { ticks: Ref<number> } {
  const ticks = ref(0);

  const timer = setInterval(() => {
    ticks.value += 1;
    task();
  }, 5000);

  onUnmounted(() => clearInterval(timer));

  return { ticks };
}
