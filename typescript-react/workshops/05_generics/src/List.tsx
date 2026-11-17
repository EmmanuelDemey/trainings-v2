// A list that renders any kind of item: the same component for users, orders or
// tags, without losing the type of the item on the way to `renderItem`.
//
// It takes `any` for now: it renders, but every caller loses its types.
import type { Key, ReactNode } from 'react';

/** TODO 1: `List<T>` — `renderItem` and `getKey` receive the type of the items. */
export interface ListProps {
  items: any[];
  getKey: (item: any) => Key;
  renderItem: (item: any) => ReactNode;
}

export function List({ items, getKey, renderItem }: ListProps) {
  return <ul />;
}
