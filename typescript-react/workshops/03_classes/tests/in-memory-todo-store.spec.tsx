import { describe, expect, test } from 'vitest';
import { InMemoryTodoStore } from '../src/in-memory-todo-store.ts';
import { behavesLikeATodoStore } from './todo-store.contract.tsx';

describe('InMemoryTodoStore', () => {
  behavesLikeATodoStore(() => new InMemoryTodoStore());

  test('tells how many todos it holds', () => {
    const store = new InMemoryTodoStore();
    store.add('Buy milk');
    expect(store.size).toBe(1);
  });

  test('counts the stores created', () => {
    const before = InMemoryTodoStore.created;
    new InMemoryTodoStore();
    new InMemoryTodoStore();
    expect(InMemoryTodoStore.created).toBe(before + 2);
  });

  test('keeps its todos private, even from JavaScript', () => {
    // Only the two arrow functions of the base class are own properties.
    expect(Object.keys(new InMemoryTodoStore())).toEqual(['subscribe', 'getSnapshot']);
  });
});
