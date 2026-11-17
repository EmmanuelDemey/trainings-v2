// The page of one todo, at `/todos/:id` — the id comes from the URL, as a string.
import { toId, TodoNotFoundError, type TodoStore } from './todo-store.ts';
import { useTodos } from './useTodos.ts';

export function TodoPage({ store, id }: { store: TodoStore; id: string }) {
  const todos = useTodos(store);
  const wanted = toId(id);
  const todo = todos.find((t) => t.id === wanted);
  if (!todo) throw new TodoNotFoundError(wanted);
  return (
    <label>
      <input type="checkbox" checked={todo.done} onChange={() => store.toggle(todo.id)} />
      {todo.title}
    </label>
  );
}
