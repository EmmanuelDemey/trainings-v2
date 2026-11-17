import { BaseTodoStore } from './base-todo-store.ts';
import type { Todo } from './todo-store.ts';

/** Keeps its todos in memory: gone on a reload. Handy in tests and stories. */
export class InMemoryTodoStore extends BaseTodoStore {
  #todos: Todo[] = [];

  /** How many stores were created — shared by every instance. */
  static #created = 0;

  constructor() {
    super();
    InMemoryTodoStore.#created++;
  }

  static get created(): number {
    return InMemoryTodoStore.#created;
  }

  get size(): number {
    return this.#todos.length;
  }

  protected load(): Todo[] {
    return [...this.#todos];
  }

  protected save(todos: Todo[]): void {
    this.#todos = [...todos];
  }
}
