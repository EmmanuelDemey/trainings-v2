// What every todo store does the same way: numbering, toggling, removing,
// notifying. Only where the todos are kept — `load` and `save` — differs.
import type { Todo, TodoId, TodoStore } from './todo-store.ts';

/**
 * TODO 2: nobody should create a BaseTodoStore, nor call `load` and `save` from
 * outside — but every subclass must write them. Say so with the right keywords.
 */
export class BaseTodoStore implements TodoStore {
  load(): Todo[] {
    throw new Error('TODO 2: left to the subclasses');
  }

  save(todos: Todo[]): void {
    throw new Error('TODO 2: left to the subclasses');
  }

  /**
   * TODO 3: `useTodos` passes `store.subscribe` and `store.getSnapshot` to
   * `useSyncExternalStore` as they are, detached from `store`: keep `this` bound.
   * `getSnapshot` loads the todos once, then gives the same array until a change.
   */
  subscribe(listener: () => void): () => void {
    throw new Error('TODO 3: subscribe');
  }

  getSnapshot(): readonly Todo[] {
    throw new Error('TODO 3: getSnapshot');
  }

  /**
   * TODO 3: the three operations, written once on top of `load` and `save`. A
   * new todo gets the highest id so far, plus one; an unknown id is a
   * TodoNotFoundError. Every change saves a new array, then calls the listeners.
   */
  add(title: string): Todo {
    throw new Error(`TODO 3: add ${title}`);
  }

  toggle(id: TodoId): Todo {
    throw new Error(`TODO 3: toggle ${id}`);
  }

  remove(id: TodoId): void {
    throw new Error(`TODO 3: remove ${id}`);
  }
}
