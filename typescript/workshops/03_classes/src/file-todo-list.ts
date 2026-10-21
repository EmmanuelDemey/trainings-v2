import { readFile, writeFile } from 'node:fs/promises';
import { BaseTodoList } from './base-todo-list.ts';
import type { Todo } from './todo-list.ts';

/**
 * TODO 5: keeps its todos in the JSON file at `path` — a read-only field, set
 * by the constructor. A file that does not exist yet is an empty list.
 */
export class FileTodoList extends BaseTodoList {
  constructor(path: string) {
    super();
  }
}
