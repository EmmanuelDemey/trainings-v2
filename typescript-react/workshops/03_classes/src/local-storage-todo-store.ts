import { BaseTodoStore } from './base-todo-store.ts';
import type { Todo } from './todo-store.ts';

/**
 * TODO 5: keeps its todos in `localStorage`, as JSON, under `key` — a read-only
 * field, set by the constructor. Nothing stored yet, or something that is not
 * JSON, is an empty list.
 */
export class LocalStorageTodoStore extends BaseTodoStore {
  constructor(key: string) {
    super();
  }
}
