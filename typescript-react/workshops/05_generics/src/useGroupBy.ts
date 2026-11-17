// The items, grouped by the key `keyOf` computes for each — recomputed only when
// the items or the function change.
import { useMemo } from 'react';

/** TODO 3: the groups, typed by the key computed. A group exists only when it has items. */
export function groupBy(items: any[], keyOf: (item: any) => string): any {
  return {};
}

export function useGroupBy(items: any[], keyOf: (item: any) => string): any {
  return useMemo(() => groupBy(items, keyOf), [items, keyOf]);
}
