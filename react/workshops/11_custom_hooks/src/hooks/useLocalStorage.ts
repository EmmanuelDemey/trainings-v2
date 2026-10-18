import { useState } from 'react';

/**
 * Like `useState`, persisted in `localStorage` as JSON, and kept in sync
 * between every component — and every tab — using the same key.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((previous: T) => T)) => void] {
  // TODO 3.1: read the value from `localStorage.getItem(key)`, parsed from JSON,
  //           falling back to `initialValue` (nothing stored, or corrupted JSON).
  // TODO 3.2: the setter writes `JSON.stringify(next)` — and accepts an updater.
  // TODO 3.3: every component using the key must see the change: subscribe to
  //           the `storage` event (other tabs) and to an event of your own (this
  //           tab) — `useSyncExternalStore` is made for this.
  void key;
  return useState(initialValue);
}
