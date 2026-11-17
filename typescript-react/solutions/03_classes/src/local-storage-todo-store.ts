import { BaseTodoStore } from './base-todo-store.ts';
import type { Todo } from './todo-store.ts';

/** Keeps its todos in `localStorage`, under `key`, as JSON: they survive a reload. */
export class LocalStorageTodoStore extends BaseTodoStore {
  readonly key: string;

  constructor(key: string) {
    super();
    this.key = key;
  }

  protected load(): Todo[] {
    const json = localStorage.getItem(this.key);
    if (json === null) return [];
    try {
      return JSON.parse(json) as Todo[];
    } catch (error) {
      if (error instanceof SyntaxError) return [];
      throw error;
    }
  }

  protected save(todos: Todo[]): void {
    localStorage.setItem(this.key, JSON.stringify(todos));
  }
}
