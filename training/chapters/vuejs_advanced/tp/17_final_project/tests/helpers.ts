import { createApp, type App } from 'vue';

export interface ComposableContext<T> extends Disposable {
  /** What the composable returned. */
  result: T;
  app: App;
  /** Unmounts the host app, which stops the effects the composable created. */
  unmount(): void;
}

/**
 * Runs a composable inside a real component context, so `onMounted`,
 * `onScopeDispose` and the effect scope behave exactly as in the application.
 *
 * Declared with `using`, so the app is unmounted at the end of the test even if
 * an assertion throws:
 *
 *   using ctx = withSetup(() => useAsyncData(fetcher));
 *   const { data, loading } = ctx.result;
 */
export function withSetup<T>(composable: () => T): ComposableContext<T> {
  let result!: T;

  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    },
  });

  app.mount(document.createElement('div'));

  let mounted = true;
  const unmount = (): void => {
    if (!mounted) return;
    mounted = false;
    app.unmount();
  };

  return { result, app, unmount, [Symbol.dispose]: unmount };
}

/**
 * Lets every pending microtask settle. `nextTick()` only flushes Vue's queue; a
 * composable awaiting a promise needs a real turn of the event loop.
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export interface FetcherCall<T> {
  signal: AbortSignal;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

/**
 * A fetcher that settles only when the test says so, and that records the
 * `AbortSignal` it was given.
 *
 * It deliberately does NOT reject on abort: plenty of real fetchers ignore the
 * signal they are handed, and the composable is expected to survive that — a
 * cancelled request that answers anyway must not overwrite fresher data.
 */
export function deferredFetcher<T>(): {
  fetcher: (signal: AbortSignal) => Promise<T>;
  calls: Array<FetcherCall<T>>;
  last: () => FetcherCall<T>;
} {
  const calls: Array<FetcherCall<T>> = [];

  const fetcher = (signal: AbortSignal): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      calls.push({ signal, resolve, reject });
    });

  return { fetcher, calls, last: () => calls[calls.length - 1] };
}

export function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError');
}
