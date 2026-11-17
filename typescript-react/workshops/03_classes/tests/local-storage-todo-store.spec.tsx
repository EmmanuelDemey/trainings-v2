import { describe, expect, test } from 'vitest';
import { LocalStorageTodoStore } from '../src/local-storage-todo-store.ts';
import { behavesLikeATodoStore } from './todo-store.contract.tsx';

/** A key no other test uses. */
function aKey(): string {
  return `todos-${crypto.randomUUID()}`;
}

describe('LocalStorageTodoStore', () => {
  behavesLikeATodoStore(() => new LocalStorageTodoStore(aKey()));

  test('writes its todos to localStorage, as JSON', () => {
    const key = aKey();
    new LocalStorageTodoStore(key).add('Buy milk');
    expect(JSON.parse(localStorage.getItem(key) ?? 'null')).toEqual([{ id: 1, title: 'Buy milk', done: false }]);
  });

  test('reads the todos another instance wrote', () => {
    const key = aKey();
    new LocalStorageTodoStore(key).add('Buy milk');
    expect(new LocalStorageTodoStore(key).getSnapshot()).toEqual([{ id: 1, title: 'Buy milk', done: false }]);
  });

  test('starts empty when what is stored is not JSON', () => {
    const key = aKey();
    localStorage.setItem(key, '{oops');
    expect(new LocalStorageTodoStore(key).getSnapshot()).toEqual([]);
  });
});
