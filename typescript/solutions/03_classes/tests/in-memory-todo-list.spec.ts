import { describe, expect, test } from 'vitest';
import { InMemoryTodoList } from '../src/in-memory-todo-list.ts';
import { behavesLikeATodoList } from './todo-list.contract.ts';

describe('InMemoryTodoList', () => {
  behavesLikeATodoList(async () => new InMemoryTodoList());

  test('tells how many todos it holds', async () => {
    const list = new InMemoryTodoList();
    await list.add('Buy milk');
    expect(list.size).toBe(1);
  });

  test('counts the lists created', () => {
    const before = InMemoryTodoList.created;
    new InMemoryTodoList();
    new InMemoryTodoList();
    expect(InMemoryTodoList.created).toBe(before + 2);
  });

  test('keeps its todos private, even from JavaScript', () => {
    expect(Object.keys(new InMemoryTodoList())).toEqual([]);
  });
});
