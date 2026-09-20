import { ref, type MaybeRefOrGetter, type Ref } from 'vue';

export interface UsePollingOptions {
  /** Reactive on purpose: a settings panel may change it while polling runs. */
  interval?: MaybeRefOrGetter<number>;
  /** Run the task once immediately, instead of waiting a first interval. */
  immediate?: boolean;
}

export interface UsePollingReturn {
  isActive: Readonly<Ref<boolean>>;
  /** How many times the task has run. Handy in a template, and in a spec. */
  ticks: Readonly<Ref<number>>;
  start(): void;
  stop(): void;
}

/**
 * Runs `task` every `interval` ms for as long as the owning scope lives.
 *
 * TODO 5: schedule the task, count the ticks, and flip `isActive`. `start()`
 *   on an already-active poll must not stack two timers.
 *
 * TODO 6: `interval` is a `MaybeRefOrGetter`. `watch` its `toValue()` and
 *   re-schedule when it changes — while active, without losing a tick count.
 *
 * TODO 7: cleanup. `onScopeDispose(stop, true)` rather than `onUnmounted`: a
 *   component's `setup` IS a scope, so this covers the component case AND keeps
 *   working inside a store, a plugin or a bare `effectScope()`.
 *
 * TODO 8: when there is no owning scope at all, nobody will ever call the
 *   cleanup. Detect it with `getCurrentScope()` and `console.warn` that the
 *   caller has to `stop()` by hand — do not leak in silence.
 */
export function usePolling(
  task: () => void | Promise<void>,
  options: UsePollingOptions = {},
): UsePollingReturn {
  const isActive = ref(false);
  const ticks = ref(0);

  return {
    isActive,
    ticks,
    start: () => {},
    stop: () => {},
  };
}
