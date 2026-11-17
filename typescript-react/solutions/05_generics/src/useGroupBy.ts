// The items, grouped by the key `keyOf` computes for each — recomputed only when
// the items or the function change.
import { useMemo } from 'react';

export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K): Partial<Record<K, T[]>> {
  const groups: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    (groups[keyOf(item)] ??= []).push(item);
  }
  return groups;
}

/** A group exists only when it has items. */
export function useGroupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K): Partial<Record<K, T[]>> {
  return useMemo(() => groupBy(items, keyOf), [items, keyOf]);
}
