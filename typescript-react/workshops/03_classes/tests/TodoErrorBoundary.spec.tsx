import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoErrorBoundary } from '../src/TodoErrorBoundary.tsx';
import { TodoNotFoundError } from '../src/todo-store.ts';

function Throws({ error }: { error: Error }): never {
  throw error;
}

describe('TodoErrorBoundary', () => {
  test('renders its children when nothing throws', () => {
    render(<TodoErrorBoundary><p>Buy milk</p></TodoErrorBoundary>);
    expect(screen.getByText('Buy milk')).toBeDefined();
  });

  test('shows the message of a TodoNotFoundError', () => {
    using _console = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<TodoErrorBoundary><Throws error={new TodoNotFoundError(42)} /></TodoErrorBoundary>);
    expect(screen.getByRole('alert').textContent).toBe('No todo with id 42');
  });

  test('lets any other error through', () => {
    using _console = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TodoErrorBoundary><Throws error={new Error('Boom')} /></TodoErrorBoundary>)).toThrow('Boom');
  });
});
