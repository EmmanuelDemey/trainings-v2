// What a component reads a todo store with: it re-renders after every change.
import { useSyncExternalStore } from 'react';
import type { Todo, TodoStore } from './todo-store.ts';

export function useTodos(store: TodoStore): readonly Todo[] {
  // Passed as they are, not called: they must not depend on `this` being `store`.
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
