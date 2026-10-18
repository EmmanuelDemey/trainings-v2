// TODO 5: every `any` below must become a type parameter, so that the type of
//         the result is computed from the arguments. Implement the bodies too.

// TODO 5.1: `groupBy<T, K extends PropertyKey>` — returns a
//           `Partial<Record<K, T[]>>`: a key with no item is absent.
export function groupBy(_items: readonly any[], _getKey: (item: any) => PropertyKey): Record<PropertyKey, any[]> {
  return {};
}

// TODO 5.2: `pick<T extends object, K extends keyof T>` — returns a `Pick<T, K>`
//           and skips a key the object does not have.
export function pick(_source: any, _keys: readonly string[]): any {
  return {};
}

// TODO 5.3: `sortBy<T>` with `key: keyof T` — returns a sorted COPY: numeric
//           strings compared as numbers, other values with `localeCompare`,
//           missing values last.
export function sortBy(items: readonly any[], _key: string): any[] {
  return [...items];
}

// TODO 5.4: `indexById<T extends { id: string }>` — returns `Record<string, T>`.
export function indexById(_items: readonly any[]): Record<string, any> {
  return {};
}
