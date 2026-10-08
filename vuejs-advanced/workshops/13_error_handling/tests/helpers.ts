import { mount, type VueWrapper } from '@vue/test-utils';
import App from '@/App.vue';
import { capture } from '@/observability/reporter';

export interface MountedApp extends Disposable {
  wrapper: VueWrapper;
}

/**
 * The console, with the same last-resort net `createOpsApp()` installs.
 *
 * Without an `errorHandler` Vue rethrows in development, so a spec about a
 * boundary would blow up on the way in rather than assert anything.
 */
export function mountConsole(): MountedApp {
  const wrapper = mount(App, {
    global: {
      config: {
        errorHandler: (err: unknown, _instance: unknown, info: string) =>
          capture(err, { info, source: 'app' }),
      },
    },
  });

  return { wrapper, [Symbol.dispose]: () => wrapper.unmount() };
}

/** An `ErrorEvent` the way the platform raises one for an uncaught throw. */
export function dispatchWindowError(message: string): void {
  window.dispatchEvent(new ErrorEvent('error', { message, error: new Error(message) }));
}

/** jsdom has no `PromiseRejectionEvent`, so build the shape the net reads. */
export function dispatchUnhandledRejection(reason: unknown): void {
  window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason }));
}
