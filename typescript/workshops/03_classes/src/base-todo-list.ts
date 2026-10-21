// What every todo list does the same way: numbering, toggling, removing. Only
// where the todos are kept — `load` and `save` — differs from one to the other.
import { TodoNotFoundError, toId } from './todo-list.ts';
import type { Todo, TodoId, TodoList } from './todo-list.ts';

/**
 * TODO 2: nobody should create a BaseTodoList, nor call `load` and `save` from
 * outside — but every subclass must write them. Say so with the right keywords.
 */
export class BaseTodoList implements TodoList {
  load(): Promise<Todo[]> {
    throw new Error('TODO 2: left to the subclasses');
  }

  save(todos: Todo[]): Promise<void> {
    throw new Error('TODO 2: left to the subclasses');
  }

  /**
   * TODO 3: the four operations, written once on top of `load` and `save`. A new
   * todo gets the highest id so far, plus one; an unknown id is a
   * TodoNotFoundError.
   */
  async add(title: string): Promise<Todo> {
    throw new Error(`TODO 3: add ${title}`);
  }

  async list(): Promise<Todo[]> {
    throw new Error('TODO 3: list');
  }

  async toggle(id: TodoId): Promise<Todo> {
    throw new Error(`TODO 3: toggle ${id}`);
  }

  async remove(id: TodoId): Promise<void> {
    throw new Error(`TODO 3: remove ${id}`);
  }
}
