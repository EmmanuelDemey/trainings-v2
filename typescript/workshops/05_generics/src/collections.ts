// Small helpers over arrays: the same code for any element type, without
// losing that type on the way out.
//
// They take and return `any` for now: they run, but every caller loses its types.

/** TODO 1: the first item of a list, or `undefined` when it is empty. */
export function first(items: any[]): any {
  return undefined;
}

/** TODO 2: the value of one key, read on every item. Only a key the items have. */
export function pluck(items: any[], key: string): any[] {
  return [];
}

/** TODO 3: the items, grouped by the key `keyOf` computes for each. A group exists only when it has items. */
export function groupBy(items: any[], keyOf: (item: any) => string): any {
  return {};
}
