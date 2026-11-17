// What every todo store does the same way: numbering, toggling, removing,
// notifying. Only where the todos are kept — `load` and `save` — differs.
import { TodoNotFoundError, toId } from './todo-store.ts';
import type { Todo, TodoId, TodoStore } from './todo-store.ts';

export abstract class BaseTodoStore implements TodoStore {
  #todos: readonly Todo[] | undefined;
  #listeners = new Set<() => void>();

  protected abstract load(): Todo[];
  protected abstract save(todos: Todo[]): void;

  // Arrow functions: `this` stays the store when `useSyncExternalStore` calls them.
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  getSnapshot = (): readonly Todo[] => (this.#todos ??= this.load());

  add(title: string): Todo {
    const trimmed = title.trim();
    if (trimmed === '') throw new Error('A todo needs a title');
    const todos = this.getSnapshot();
    const todo: Todo = { id: Math.max(0, ...todos.map((t) => t.id)) + 1, title: trimmed, done: false };
    this.#commit([...todos, todo]);
    return todo;
  }

  toggle(id: TodoId): Todo {
    const wanted = toId(id);
    const todos = this.getSnapshot();
    const todo = todos.find((t) => t.id === wanted);
    if (!todo) throw new TodoNotFoundError(wanted);
    const toggled = { ...todo, done: !todo.done };
    this.#commit(todos.map((t) => (t.id === wanted ? toggled : t)));
    return toggled;
  }

  remove(id: TodoId): void {
    const wanted = toId(id);
    const todos = this.getSnapshot();
    if (!todos.some((t) => t.id === wanted)) throw new TodoNotFoundError(wanted);
    this.#commit(todos.filter((t) => t.id !== wanted));
  }

  /** Saves a new array — never the old one, mutated — and tells the components. */
  #commit(todos: Todo[]): void {
    this.save(todos);
    this.#todos = todos;
    this.#listeners.forEach((listener) => listener());
  }
}
