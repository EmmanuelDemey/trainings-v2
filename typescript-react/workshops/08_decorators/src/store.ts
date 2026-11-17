// The base of every store of the app — given. A store is a plain class that
// React components subscribe to with `useStore`, through `useSyncExternalStore`.
import { useSyncExternalStore } from 'react';

export class Store {
  #listeners = new Set<() => void>();
  #version = 0;

  // Arrow fields, not methods: `useSyncExternalStore` receives them detached
  // from the store, without their `this`.
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  getSnapshot = (): number => this.#version;

  /** Tells every subscribed component that the store changed. */
  notify(): void {
    this.#version += 1;
    for (const listener of this.#listeners) listener();
  }
}

/**
 * Auto-accessor decorator: every assignment re-renders the components that use
 * the store — `@observable accessor discount = 0`.
 */
export function observable<This extends Store, Value>(
  target: ClassAccessorDecoratorTarget<This, Value>,
  _context: ClassAccessorDecoratorContext<This, Value>,
): ClassAccessorDecoratorResult<This, Value> {
  return {
    set(value) {
      target.set.call(this, value);
      this.notify();
    },
  };
}

/** Re-renders the component each time `store` notifies. Returns the store. */
export function useStore<S extends Store>(store: S): S {
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return store;
}
