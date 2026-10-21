// The state of a <select>: its options, and the one selected.

export interface Select<T extends string> {
  readonly options: readonly T[];
  selected: T;
}

/** TODO 7: the options keep their literal types, and `initial` must be one of them. */
export function createSelect(options: readonly string[], initial: string): Select<string> {
  return { options, selected: options[0] ?? initial };
}
