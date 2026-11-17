// The todos of the app. Both functions below are called by src/App.tsx and
// driven by tests/todo.spec.tsx.
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

/** TODO 3: the same todo, flipped. The one passed in is left untouched — React compares by reference. */
export function toggle(todo) {
  return todo;
}
