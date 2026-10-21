// What every todo list does the same way: numbering, toggling, removing. Only
// where the todos are kept — `load` and `save` — differs from one to the other.
import { TodoNotFoundError, toId } from './todo-list.ts';
import type { Todo, TodoId, TodoList } from './todo-list.ts';

export abstract class BaseTodoList implements TodoList {
  protected abstract load(): Promise<Todo[]>;
  protected abstract save(todos: Todo[]): Promise<void>;

  async add(title: string): Promise<Todo> {
    const trimmed = title.trim();
    if (trimmed === '') throw new Error('A todo needs a title');
    const todos = await this.load();
    const todo: Todo = { id: Math.max(0, ...todos.map((t) => t.id)) + 1, title: trimmed, done: false };
    await this.save([...todos, todo]);
    return todo;
  }

  async list(): Promise<Todo[]> {
    return this.load();
  }

  async toggle(id: TodoId): Promise<Todo> {
    const wanted = toId(id);
    const todos = await this.load();
    const todo = todos.find((t) => t.id === wanted);
    if (!todo) throw new TodoNotFoundError(wanted);
    const toggled = { ...todo, done: !todo.done };
    await this.save(todos.map((t) => (t.id === wanted ? toggled : t)));
    return toggled;
  }

  async remove(id: TodoId): Promise<void> {
    const wanted = toId(id);
    const todos = await this.load();
    if (!todos.some((t) => t.id === wanted)) throw new TodoNotFoundError(wanted);
    await this.save(todos.filter((t) => t.id !== wanted));
  }
}
