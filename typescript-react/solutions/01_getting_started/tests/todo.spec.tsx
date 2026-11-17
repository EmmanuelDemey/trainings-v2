import { describe, expect, test } from 'vitest';
import { createTodo, toggle } from '../src/todo.ts';

describe('createTodo', () => {
  test('creates a todo that is not done yet', () => {
    expect(createTodo(1, 'Buy milk')).toEqual({ id: 1, title: 'Buy milk', done: false });
  });

  test('trims the title', () => {
    expect(createTodo(1, '  Buy milk ').title).toBe('Buy milk');
  });

  test('refuses an empty title', () => {
    expect(() => createTodo(1, '   ')).toThrow('A todo needs a title');
  });
});

describe('toggle', () => {
  test('flips done', () => {
    expect(toggle({ id: 1, title: 'Buy milk', done: false }).done).toBe(true);
    expect(toggle({ id: 1, title: 'Buy milk', done: true }).done).toBe(false);
  });

  test('leaves the todo passed in untouched', () => {
    const todo = { id: 1, title: 'Buy milk', done: false };
    toggle(todo);
    expect(todo.done).toBe(false);
  });
});
