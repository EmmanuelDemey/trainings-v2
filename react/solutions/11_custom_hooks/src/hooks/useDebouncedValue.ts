import { useEffect, useState } from 'react';

/**
 * `value`, but only once it has stopped changing for `delay` ms. Typing
 * "skywalker" sends one request instead of nine.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    // Each new value cancels the pending timer: only the last one survives.
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
