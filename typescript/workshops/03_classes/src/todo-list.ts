// The contract every todo list honours, wherever it keeps its todos.

export interface Todo {
  readonly id: number;
  title: string;
  done: boolean;
}

/** An id as the CLI reads it (`"3"`), or as the code holds it (`3`). */
export type TodoId = string | number;

export interface TodoList {
  add(title: string): Promise<Todo>;
  list(): Promise<Todo[]>;
  toggle(id: TodoId): Promise<Todo>;
  remove(id: TodoId): Promise<void>;
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
