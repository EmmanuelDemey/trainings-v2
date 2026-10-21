import { readFile, writeFile } from 'node:fs/promises';
import { BaseTodoList } from './base-todo-list.ts';
import type { Todo } from './todo-list.ts';

/** Keeps its todos in a JSON file: they survive a restart. */
export class FileTodoList extends BaseTodoList {
  readonly path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  protected async load(): Promise<Todo[]> {
    try {
      return JSON.parse(await readFile(this.path, 'utf8')) as Todo[];
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
      throw error;
    }
  }

  protected async save(todos: Todo[]): Promise<void> {
    await writeFile(this.path, `${JSON.stringify(todos, null, 2)}\n`);
  }
}
