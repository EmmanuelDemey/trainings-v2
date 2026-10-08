import { effectScope, type EffectScope } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import App from '@/App.vue';

export interface MountedApp extends Disposable {
  wrapper: VueWrapper;
}

export function mountApp(): MountedApp {
  const wrapper = mount(App);
  return { wrapper, [Symbol.dispose]: () => wrapper.unmount() };
}

export interface ScopeContext<T> extends Disposable {
  result: T;
  scope: EffectScope;
  /** Disposes the scope by hand, to assert what the cleanup does. */
  dispose(): void;
}

/**
 * Runs a composable inside a bare `effectScope()` — not a component.
 *
 * That is the case convention 3 is about: `onUnmounted` would never fire here,
 * `onScopeDispose` does. A composable that only works inside a component cannot
 * be called from a Pinia store or a plugin.
 */
export function withScope<T>(composable: () => T): ScopeContext<T> {
  const scope = effectScope();
  const result = scope.run(composable)!;

  let alive = true;
  const dispose = (): void => {
    if (!alive) return;
    alive = false;
    scope.stop();
  };

  return { result, scope, dispose, [Symbol.dispose]: dispose };
}
