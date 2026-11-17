// The line under the list. Driven by tests/Summary.spec.tsx.
import type { ReactElement } from 'react';
import type { Todo } from './todo.ts';

export interface SummaryProps {
  todos: Todo[];
}

/** `<p>2/3 done</p>` — or `<p>nothing to do</p>` when the list is empty. */
export function Summary({ todos }: SummaryProps): ReactElement {
  if (todos.length === 0) return <p>nothing to do</p>;
  const done = todos.filter((todo) => todo.done).length;
  return <p>{`${done}/${todos.length} done`}</p>;
}
