import { describe, expectTypeOf, test } from 'vitest';
import { BaseTodoStore } from '../src/base-todo-store.ts';
import { InMemoryTodoStore } from '../src/in-memory-todo-store.ts';
import { LocalStorageTodoStore } from '../src/local-storage-todo-store.ts';
import { toId } from '../src/todo-store.ts';
import type { TodoStore } from '../src/todo-store.ts';

describe('the implementations', () => {
  test('are TodoStores', () => {
    expectTypeOf<InMemoryTodoStore>().toExtend<TodoStore>();
    expectTypeOf<LocalStorageTodoStore>().toExtend<TodoStore>();
  });

  test('share an abstract base class', () => {
    expectTypeOf<InMemoryTodoStore>().toExtend<BaseTodoStore>();
    expectTypeOf<LocalStorageTodoStore>().toExtend<BaseTodoStore>();
    // @ts-expect-error — an abstract class cannot be instantiated
    new BaseTodoStore();
  });

  test('do not expose how they store their todos', () => {
    // @ts-expect-error — load is protected
    new InMemoryTodoStore().load();
  });
});

describe('LocalStorageTodoStore', () => {
  test('cannot change the key it writes to', () => {
    const store = new LocalStorageTodoStore('todos');
    // @ts-expect-error — key is readonly
    store.key = 'other';
  });
});

describe('toId', () => {
  test('accepts a number or a string, and nothing else', () => {
    expectTypeOf(toId).toBeCallableWith(3);
    expectTypeOf(toId).toBeCallableWith('3');
    // @ts-expect-error — a boolean is not an id
    toId(true);
  });
});
