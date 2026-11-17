import type { Get, PathOf } from './types.ts';

/** Reads the value at a dotted path — the path is checked, the result typed. */
export function get<T, P extends PathOf<T>>(object: T, path: P): Get<T, P> {
  let value: unknown = object;
  for (const key of path.split('.')) value = (value as Record<string, unknown>)[key];
  return value as Get<T, P>;
}
