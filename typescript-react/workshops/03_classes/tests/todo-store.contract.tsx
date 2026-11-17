// The behaviour every TodoStore must have — run once per implementation.
import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { TodoNotFoundError } from '../src/todo-store.ts';
import type { TodoStore } from '../src/todo-store.ts';
import { useTodos } from '../src/useTodos.ts';

export function behavesLikeATodoStore(create: () => TodoStore) {
  describe('add', () => {
    test('adds a todo, not done, numbered from 1', () => {
      const store = create();
      expect(store.add('Buy milk')).toEqual({ id: 1, title: 'Buy milk', done: false });
      expect(store.add('Call Bob')).toEqual({ id: 2, title: 'Call Bob', done: false });
    });

    test('refuses an empty title', () => {
      const store = create();
      expect(() => store.add('  ')).toThrow('A todo needs a title');
    });
  });

  describe('getSnapshot', () => {
    test('lists the todos in the order they were added', () => {
      const store = create();
      store.add('Buy milk');
      store.add('Call Bob');
      expect(store.getSnapshot().map((todo) => todo.title)).toEqual(['Buy milk', 'Call Bob']);
    });

    test('gives the same array until something changes', () => {
      const store = create();
      store.add('Buy milk');
      const before = store.getSnapshot();
      expect(store.getSnapshot()).toBe(before);
      store.add('Call Bob');
      expect(store.getSnapshot()).not.toBe(before);
    });
  });

  describe('toggle', () => {
    test('toggles a todo by its numeric id', () => {
      const store = create();
      store.add('Buy milk');
      expect(store.toggle(1).done).toBe(true);
      expect(store.getSnapshot()[0]?.done).toBe(true);
    });

    test('toggles a todo by an id read from the URL', () => {
      const store = create();
      store.add('Buy milk');
      store.add('Call Bob');
      expect(store.toggle('2')).toEqual({ id: 2, title: 'Call Bob', done: true });
    });

    test('rejects an unknown id with a TodoNotFoundError', () => {
      const store = create();
      expect(() => store.toggle(42)).toThrow(TodoNotFoundError);
    });
  });

  describe('remove', () => {
    test('removes a todo, and never reuses its id', () => {
      const store = create();
      store.add('Buy milk');
      store.add('Call Bob');
      store.remove('1');
      expect(store.getSnapshot().map((todo) => todo.id)).toEqual([2]);
      expect(store.add('Learn TypeScript').id).toBe(3);
    });

    test('rejects an unknown id', () => {
      const store = create();
      expect(() => store.remove(42)).toThrow('No todo with id 42');
    });
  });

  describe('useTodos', () => {
    test('re-renders the component after every change', () => {
      const store = create();
      const { result } = renderHook(() => useTodos(store));
      expect(result.current).toEqual([]);
      act(() => {
        store.add('Buy milk');
      });
      expect(result.current).toEqual([{ id: 1, title: 'Buy milk', done: false }]);
    });
  });
}
