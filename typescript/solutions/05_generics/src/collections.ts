// Small helpers over arrays: the same code for any element type, without
// losing that type on the way out.

/** The first item of a list, or `undefined` when it is empty. */
export function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

/** The value of one key, read on every item. */
export function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

/** The items, grouped by the key `keyOf` computes for each. A group exists only when it has items. */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Partial<Record<K, T[]>> {
  const groups: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    const key = keyOf(item);
    (groups[key] ??= []).push(item);
  }
  return groups;
}
