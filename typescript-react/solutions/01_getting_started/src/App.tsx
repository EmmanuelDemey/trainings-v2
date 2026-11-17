// The todo list: a form to add a todo, the list, and the last todo added.
import { useState } from 'react';
import { Summary } from './Summary.tsx';
import { TodoItem } from './TodoItem.tsx';
import { createTodo, toggle } from './todo.ts';

const initialTodos = [createTodo(1, 'Buy milk'), createTodo(2, 'Call Bob'), createTodo(3, 'Learn TypeScript')];
initialTodos[0] = toggle(initialTodos[0]);

export function App() {
  const [todos, setTodos] = useState(initialTodos);
  const [title, setTitle] = useState('');

  const lastAdded = todos.at(-1);

  const handleToggle = (id: number) => setTodos(todos.map((todo) => (todo.id === id ? toggle(todo) : todo)));

  return (
    <main>
      <h1>Todos</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setTodos([...todos, createTodo(todos.length + 1, title)]);
          setTitle('');
        }}
      >
        <input aria-label="New todo" value={title} onChange={(event) => setTitle(event.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
        ))}
      </ul>
      <Summary todos={todos} />
      <h2>Last added</h2>
      {/*
        `todos.at(-1)` is typed `Todo | undefined`: on an empty array there is no
        last element, and the checker cannot know this list is never empty. With
        `strictNullChecks`, `undefined` is not a `Todo`, so `TodoItem` refuses it.
        A `!` or an `as` would only silence the checker; checking the value first
        narrows it to a `Todo` — and renders nothing when there is none.
      */}
      {lastAdded !== undefined && (
        <ul>
          <TodoItem todo={lastAdded} onToggle={handleToggle} />
        </ul>
      )}
    </main>
  );
}
