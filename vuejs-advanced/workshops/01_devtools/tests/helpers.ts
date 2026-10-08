import { mount, type VueWrapper } from '@vue/test-utils';
import App from '@/App.vue';

export interface MountedDashboard extends Disposable {
  wrapper: VueWrapper;
}

/**
 * Mounts the dashboard and guarantees it is unmounted at the end of the test,
 * even if an assertion throws. That matters here: the app owns a `setInterval`,
 * and a leaked one keeps ticking into the next test.
 *
 *   using dashboard = mountDashboard();
 *   dashboard.wrapper.get('[data-testid="clock"]');
 */
export function mountDashboard(): MountedDashboard {
  const wrapper = mount(App, { attachTo: document.body });

  return {
    wrapper,
    [Symbol.dispose]: () => wrapper.unmount(),
  };
}
