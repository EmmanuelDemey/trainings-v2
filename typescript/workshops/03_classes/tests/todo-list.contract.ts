// The behaviour every TodoList must have — run once per implementation.
import { describe, expect, test } from 'vitest';
import { TodoNotFoundError } from '../src/todo-list.ts';
import type { TodoList } from '../src/todo-list.ts';

export function behavesLikeATodoList(create: () => Promise<TodoList>) {
  describe('add', () => {
    test('adds a todo, not done, numbered from 1', async () => {
      const list = await create();
      expect(await list.add('Buy milk')).toEqual({ id: 1, title: 'Buy milk', done: false });
      expect(await list.add('Call Bob')).toEqual({ id: 2, title: 'Call Bob', done: false });
    });

    test('refuses an empty title', async () => {
      const list = await create();
      await expect(list.add('  ')).rejects.toThrow('A todo needs a title');
    });
  });

  describe('list', () => {
    test('lists the todos in the order they were added', async () => {
      const list = await create();
      await list.add('Buy milk');
      await list.add('Call Bob');
      expect((await list.list()).map((todo) => todo.title)).toEqual(['Buy milk', 'Call Bob']);
    });
  });

  describe('toggle', () => {
    test('toggles a todo by its numeric id', async () => {
      const list = await create();
      await list.add('Buy milk');
      expect((await list.toggle(1)).done).toBe(true);
      expect((await list.list())[0]?.done).toBe(true);
    });

    test('toggles a todo by an id read from the command line', async () => {
      const list = await create();
      await list.add('Buy milk');
      await list.add('Call Bob');
      expect(await list.toggle('2')).toEqual({ id: 2, title: 'Call Bob', done: true });
    });

    test('rejects an unknown id with a TodoNotFoundError', async () => {
      const list = await create();
      await expect(list.toggle(42)).rejects.toBeInstanceOf(TodoNotFoundError);
    });
  });

  describe('remove', () => {
    test('removes a todo, and never reuses its id', async () => {
      const list = await create();
      await list.add('Buy milk');
      await list.add('Call Bob');
      await list.remove('1');
      expect((await list.list()).map((todo) => todo.id)).toEqual([2]);
      expect((await list.add('Learn TypeScript')).id).toBe(3);
    });

    test('rejects an unknown id', async () => {
      const list = await create();
      await expect(list.remove(42)).rejects.toThrow('No todo with id 42');
    });
  });
}
