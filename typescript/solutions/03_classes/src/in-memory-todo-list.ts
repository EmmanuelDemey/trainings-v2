import { BaseTodoList } from './base-todo-list.ts';
import type { Todo } from './todo-list.ts';

/** Keeps its todos in memory: gone when the process ends. Handy in tests. */
export class InMemoryTodoList extends BaseTodoList {
  #todos: Todo[] = [];

  /** How many lists were created — shared by every instance. */
  static #created = 0;

  constructor() {
    super();
    InMemoryTodoList.#created++;
  }

  static get created(): number {
    return InMemoryTodoList.#created;
  }

  get size(): number {
    return this.#todos.length;
  }

  protected async load(): Promise<Todo[]> {
    return [...this.#todos];
  }

  protected async save(todos: Todo[]): Promise<void> {
    this.#todos = [...todos];
  }
}
