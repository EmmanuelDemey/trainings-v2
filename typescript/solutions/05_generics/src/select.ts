// The state of a <select>: its options, and the one selected.

export interface Select<T extends string> {
  readonly options: readonly T[];
  selected: T;
}

/** The options keep their literal types, and `initial` must be one of them. */
export function createSelect<T extends string>(options: readonly T[], initial: NoInfer<T>): Select<T> {
  return { options, selected: initial };
}
