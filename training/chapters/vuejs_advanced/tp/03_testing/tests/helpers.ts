import { createApp, type App } from 'vue';

/**
 * Runs a composable inside a real component context, so `onMounted`,
 * `onUnmounted` and `inject` work. Remember to `app.unmount()` at the end when
 * you want the cleanup hooks to run.
 */
export function withSetup<T>(composable: () => T): [T, App] {
  let result!: T;

  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    },
  });

  app.mount(document.createElement('div'));
  return [result, app];
}
