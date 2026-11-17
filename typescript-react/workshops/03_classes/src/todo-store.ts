// The contract every todo store honours, wherever it keeps its todos — and
// what a component needs to read it with `useSyncExternalStore`.

export interface Todo {
  readonly id: number;
  title: string;
  done: boolean;
}

/** An id as a route param gives it (`"3"`), or as the code holds it (`3`). */
export type TodoId = string | number;

export interface TodoStore {
  /** Calls `listener` after every change. Returns the function that unsubscribes. */
  subscribe(listener: () => void): () => void;
  /** The todos — the same array until something changes. */
  getSnapshot(): readonly Todo[];
  add(title: string): Todo;
  toggle(id: TodoId): Todo;
  remove(id: TodoId): void;
}

/**
 * TODO 1: thrown when an id matches no todo — an `Error` named
 * `TodoNotFoundError`, whose message is `No todo with id <id>`, and which keeps
 * the `id`, read-only.
 */
export class TodoNotFoundError extends Error {
  id: number = 0;

  constructor(id: number) {
    super();
  }
}

/** TODO 1: `3` and `"3"` both give `3`; anything else throws `Invalid id: <id>`. */
export function toId(id: TodoId): number {
  throw new Error(`TODO 1: read the id ${id}`);
}
