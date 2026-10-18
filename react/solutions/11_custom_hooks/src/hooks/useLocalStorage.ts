import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * The `storage` event only reaches the OTHER tabs. For the other components of
 * THIS tab, every write also dispatches this event.
 */
const LOCAL_CHANGE = 'local-storage-change';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(LOCAL_CHANGE, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(LOCAL_CHANGE, onChange);
  };
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted by hand, or by an older version of the app: start afresh.
    return fallback;
  }
}

/**
 * Like `useState`, persisted in `localStorage` as JSON, and kept in sync
 * between every component — and every tab — using the same key.
 *
 * `localStorage` is an external store: `useSyncExternalStore` is the hook made
 * to read one. Its snapshot is the RAW string, which compares by value; a
 * parsed object would be new on every read and re-render forever.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((previous: T) => T)) => void] {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(key));
  // Parse once per stored string, not on every render.
  const value = useMemo(() => parse(raw, initialValue), [raw, initialValue]);

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const previous = parse(localStorage.getItem(key), initialValue);
      const resolved = typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      window.dispatchEvent(new Event(LOCAL_CHANGE));
    },
    [key, initialValue],
  );

  return [value, setValue];
}
