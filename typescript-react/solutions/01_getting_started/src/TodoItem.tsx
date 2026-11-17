// One todo of the list. Driven by tests/TodoItem.spec.tsx.
import type { ReactElement } from 'react';
import type { Todo } from './todo.ts';

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
}

/**
 * A `<li>` holding a checkbox labelled with the title — checked when the todo
 * is done. Clicking it calls `onToggle` with the id of the todo.
 */
export function TodoItem({ todo, onToggle }: TodoItemProps): ReactElement {
  return (
    <li>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        {todo.title}
      </label>
    </li>
  );
}
