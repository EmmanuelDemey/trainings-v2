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

/** Thrown when an id matches no todo. */
export class TodoNotFoundError extends Error {
  readonly id: number;

  constructor(id: number) {
    super(`No todo with id ${id}`);
    this.name = 'TodoNotFoundError';
    this.id = id;
  }
}

/** `3` and `"3"` both give `3`; anything else is an error. */
export function toId(id: TodoId): number {
  const value = typeof id === 'string' ? Number(id) : id;
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid id: ${id}`);
  return value;
}
