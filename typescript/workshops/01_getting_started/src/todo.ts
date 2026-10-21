// The todo list of the CLI. Every function below is called by src/cli.ts and
// driven by tests/todo.spec.ts.
//
// The parameters have no type yet: with `"strict": false`, TypeScript lets them
// be `any`. Turning `strict` on (TODO 1, in tsconfig.json) is what makes it ask.

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

/** TODO 2: a new todo — not done, its title trimmed. An empty title is an error. */
export function createTodo(id, title) {
  return { id, title, done: true };
}

/** TODO 3: the same todo, flipped. The one passed in is left untouched. */
export function toggle(todo) {
  return todo;
}

/** TODO 4: `"2/3 done"` — or `"nothing to do"` when the list is empty. */
export function summary(todos) {
  return '';
}

/** TODO 5: one line per todo: `[x] 1 Buy milk` or `[ ] 2 Call Bob`. */
export function formatTodo(todo) {
  return todo.title;
}
