import { describe, expect, test } from 'vitest';
import { TodoNotFoundError, toId } from '../src/todo-list.ts';

describe('toId', () => {
  test('keeps a number', () => {
    expect(toId(3)).toBe(3);
  });

  test('reads a string', () => {
    expect(toId('3')).toBe(3);
  });

  test.each(['abc', '', '1.5', 0, -2])('refuses %j', (id) => {
    expect(() => toId(id as never)).toThrow(`Invalid id: ${id}`);
  });
});

describe('TodoNotFoundError', () => {
  test('is an Error, named after its class, that keeps the id', () => {
    const error = new TodoNotFoundError(42);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TodoNotFoundError');
    expect(error.message).toBe('No todo with id 42');
    expect(error.id).toBe(42);
  });
});
