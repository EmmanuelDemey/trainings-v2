import {
  getCurrentScope,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';

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
 * The interval is a reactive input, so a change re-schedules without losing the
 * tick count. `start()` on an active poll is a no-op — stacking two intervals is
 * the bug that makes a dashboard hammer its backend after a few navigations.
 */
export function usePolling(
  task: () => void | Promise<void>,
  options: UsePollingOptions = {},
): UsePollingReturn {
  const { interval = 5000, immediate = false } = options;

  const isActive = ref(false);
  const ticks = ref(0);

  let timer: ReturnType<typeof setInterval> | undefined;

  function run(): void {
    ticks.value += 1;
    void task();
  }

  function clear(): void {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  function schedule(): void {
    clear();
    timer = setInterval(run, toValue(interval));
  }

  function start(): void {
    if (isActive.value) return;
    isActive.value = true;
    schedule();
  }

  function stop(): void {
    isActive.value = false;
    clear();
  }

  watch(
    () => toValue(interval),
    () => {
      if (isActive.value) schedule();
    },
  );

  if (getCurrentScope()) {
    onScopeDispose(stop);
  } else {
    // No owner means nobody will ever clean up after us. Say so, loudly, rather
    // than leaking an interval for the lifetime of the page.
    console.warn(
      '[acme] usePolling was called outside an effect scope — nothing will clean it up, call stop() yourself',
    );
  }

  start();
  if (immediate) run();

  return { isActive, ticks, start, stop };
}
