// The todo list of the CLI. Every function below is called by src/cli.ts and
// driven by tests/todo.spec.ts.

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

/** A new todo — not done, its title trimmed. An empty title is an error. */
export function createTodo(id: number, title: string): Todo {
  const trimmed = title.trim();
  if (trimmed === '') throw new Error('A todo needs a title');
  return { id, title: trimmed, done: false };
}

/** The same todo, flipped. The one passed in is left untouched. */
export function toggle(todo: Todo): Todo {
  return { ...todo, done: !todo.done };
}

/** `"2/3 done"` — or `"nothing to do"` when the list is empty. */
export function summary(todos: Todo[]): string {
  if (todos.length === 0) return 'nothing to do';
  const done = todos.filter((todo) => todo.done).length;
  return `${done}/${todos.length} done`;
}

/** One line per todo: `[x] 1 Buy milk` or `[ ] 2 Call Bob`. */
export function formatTodo(todo: Todo): string {
  return `[${todo.done ? 'x' : ' '}] ${todo.id} ${todo.title}`;
}
