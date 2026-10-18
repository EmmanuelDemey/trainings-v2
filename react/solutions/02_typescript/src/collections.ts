// Generics: the type of the result is computed from the type of the arguments.
// One implementation, typed for people, planets, invoices…

/** Groups items by the key `getKey` returns — `Object.groupBy`, by hand. */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  getKey: (item: T) => K,
): Partial<Record<K, T[]>> {
  // Partial: a key with no item is absent, not an empty array.
  const groups: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    const key = getKey(item);
    (groups[key] ??= []).push(item);
  }
  return groups;
}

/** A copy of `source` restricted to `keys` — typed `Pick<T, K>`. */
export function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in source) result[key] = source[key];
  }
  return result;
}

/** A sorted COPY of `items`: missing values last, numbers compared as numbers. */
export function sortBy<T>(items: readonly T[], key: keyof T): T[] {
  return [...items].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (left === right) return 0;
    if (left === undefined || left === null) return 1;
    if (right === undefined || right === null) return -1;
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) return leftNumber - rightNumber;
    return String(left).localeCompare(String(right));
  });
}

/** Indexes items by their `id`. */
export function indexById<T extends { id: string }>(items: readonly T[]): Record<string, T> {
  const index: Record<string, T> = {};
  for (const item of items) index[item.id] = item;
  return index;
}
