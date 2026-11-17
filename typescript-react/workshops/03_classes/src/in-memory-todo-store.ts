import { BaseTodoStore } from './base-todo-store.ts';
import type { Todo } from './todo-store.ts';

/**
 * TODO 4: keeps its todos in memory — in a `#private` field, invisible even to
 * `Object.keys`. Gone on a reload: handy in tests and stories.
 */
export class InMemoryTodoStore extends BaseTodoStore {
  /** TODO 4: how many stores were created so far — shared by every instance. */
  static get created(): number {
    return 0;
  }

  /** TODO 4: how many todos this store holds. */
  get size(): number {
    return 0;
  }
}
