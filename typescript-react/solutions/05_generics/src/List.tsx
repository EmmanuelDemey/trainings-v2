// A list that renders any kind of item: the same component for users, orders or
// tags, without losing the type of the item on the way to `renderItem`.
import type { Key, ReactNode } from 'react';

export interface ListProps<T> {
  items: readonly T[];
  getKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
}

export function List<T>({ items, getKey, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
