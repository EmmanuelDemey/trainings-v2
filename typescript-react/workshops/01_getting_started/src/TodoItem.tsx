// One todo of the list. Driven by tests/TodoItem.spec.tsx.

/**
 * TODO 5: a `<li>` holding a checkbox labelled with the title — checked when
 * the todo is done. Clicking it calls `onToggle` with the id of the todo.
 */
export function TodoItem({ todo, onToggle }) {
  return <li>{todo.title}</li>;
}
