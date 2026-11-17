// The todos of the app. Both functions below are called by src/App.tsx and
// driven by tests/todo.spec.tsx.

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

/** The same todo, flipped. The one passed in is left untouched — React compares by reference. */
export function toggle(todo: Todo): Todo {
  return { ...todo, done: !todo.done };
}
