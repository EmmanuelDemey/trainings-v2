import { describe, expect, test } from 'vitest';
import { createTodo, formatTodo, summary, toggle } from '../src/todo.ts';

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

describe('summary', () => {
  test('counts the todos done', () => {
    const todos = [
      { id: 1, title: 'Buy milk', done: true },
      { id: 2, title: 'Call Bob', done: false },
      { id: 3, title: 'Learn TypeScript', done: true },
    ];
    expect(summary(todos)).toBe('2/3 done');
  });

  test('says when there is nothing to do', () => {
    expect(summary([])).toBe('nothing to do');
  });
});

describe('formatTodo', () => {
  test('checks the box of a todo done', () => {
    expect(formatTodo({ id: 1, title: 'Buy milk', done: true })).toBe('[x] 1 Buy milk');
  });

  test('leaves the box of a pending todo empty', () => {
    expect(formatTodo({ id: 2, title: 'Call Bob', done: false })).toBe('[ ] 2 Call Bob');
  });
});
