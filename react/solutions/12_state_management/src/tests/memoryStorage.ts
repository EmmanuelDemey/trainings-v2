import { vi } from 'vitest';

/**
 * A `localStorage` stand-in, one per test: no state leaks from a test to the
 * next, and `setItem` is a spy the specs can assert on.
 */
export function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}
