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
 * `onUnmounted`, `inject` and — the one that matters here — the effect scope
 * behave exactly as they do in an application.
 *
 * Declared with `using`, so the app is unmounted at the end of the test even if
 * an assertion throws:
 *
 *   using ctx = withSetup(() => useFetch('/api/products'));
 *   const { data, error, loading } = ctx.result;
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
 * Lets every pending microtask settle. `nextTick()` only flushes Vue's queue;
 * a composable awaiting `fetch()` then `response.json()` needs a real turn of
 * the event loop.
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
