import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InMemoryTodoStore } from '../src/in-memory-todo-store.ts';
import { TodoErrorBoundary } from '../src/TodoErrorBoundary.tsx';
import { TodoPage } from '../src/TodoPage.tsx';

describe('TodoPage', () => {
  test('shows the todo of the URL, and toggles it', async () => {
    const store = new InMemoryTodoStore();
    store.add('Buy milk');
    render(<TodoPage store={store} id="1" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Buy milk' });
    await userEvent.click(checkbox);
    expect(checkbox).toHaveProperty('checked', true);
    expect(store.getSnapshot()[0]?.done).toBe(true);
  });

  test('ends in the error boundary for an unknown id', () => {
    using _console = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <TodoErrorBoundary>
        <TodoPage store={new InMemoryTodoStore()} id="42" />
      </TodoErrorBoundary>,
    );
    expect(screen.getByRole('alert').textContent).toBe('No todo with id 42');
  });
});
