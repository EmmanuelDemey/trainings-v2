import { describe, expectTypeOf, test } from 'vitest';
import { BaseTodoList } from '../src/base-todo-list.ts';
import { FileTodoList } from '../src/file-todo-list.ts';
import { InMemoryTodoList } from '../src/in-memory-todo-list.ts';
import { toId } from '../src/todo-list.ts';
import type { TodoList } from '../src/todo-list.ts';

describe('the implementations', () => {
  test('are TodoLists', () => {
    expectTypeOf<InMemoryTodoList>().toExtend<TodoList>();
    expectTypeOf<FileTodoList>().toExtend<TodoList>();
  });

  test('share an abstract base class', () => {
    expectTypeOf<InMemoryTodoList>().toExtend<BaseTodoList>();
    expectTypeOf<FileTodoList>().toExtend<BaseTodoList>();
    // @ts-expect-error — an abstract class cannot be instantiated
    new BaseTodoList();
  });

  test('do not expose how they store their todos', () => {
    // @ts-expect-error — load is protected
    new InMemoryTodoList().load();
  });
});

describe('FileTodoList', () => {
  test('cannot change the file it writes to', () => {
    const list = new FileTodoList('todos.json');
    // @ts-expect-error — path is readonly
    list.path = 'other.json';
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
