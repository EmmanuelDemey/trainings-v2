import { BaseTodoList } from './base-todo-list.ts';
import type { Todo } from './todo-list.ts';

/**
 * TODO 4: keeps its todos in memory — in a `#private` field, invisible even to
 * `Object.keys`. Gone when the process ends: handy in tests.
 */
export class InMemoryTodoList extends BaseTodoList {
  /** TODO 4: how many lists were created so far — shared by every instance. */
  static get created(): number {
    return 0;
  }

  /** TODO 4: how many todos this list holds. */
  get size(): number {
    return 0;
  }
}
