import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { FileTodoList } from '../src/file-todo-list.ts';
import { behavesLikeATodoList } from './todo-list.contract.ts';

async function aFile(): Promise<string> {
  return join(await mkdtemp(join(tmpdir(), 'todos-')), 'todos.json');
}

describe('FileTodoList', () => {
  behavesLikeATodoList(async () => new FileTodoList(await aFile()));

  test('writes its todos to the file, as JSON', async () => {
    const path = await aFile();
    await new FileTodoList(path).add('Buy milk');
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual([{ id: 1, title: 'Buy milk', done: false }]);
  });

  test('reads the todos another instance wrote', async () => {
    const path = await aFile();
    await new FileTodoList(path).add('Buy milk');
    expect(await new FileTodoList(path).list()).toEqual([{ id: 1, title: 'Buy milk', done: false }]);
  });
});
