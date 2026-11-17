// The state of a list of entities — any entity that carries a string `id`.
import { useState } from 'react';

export interface Entity {
  id: string;
}

/**
 * TODO 4: make it generic — `useCollection<User>()` stores users, and only an
 * entity with a string `id` can be stored.
 */
export function useCollection<T = any>(initial: any[] = []) {
  const [items, setItems] = useState<any[]>(initial);

  /** Stores the entity, replacing the one with the same id. */
  function save(entity: any): void {}

  function findById(id: string): any {
    return undefined;
  }

  /** TODO 5: merges `changes` into the stored entity. The id cannot change. Throws when the id is unknown. */
  function update(id: string, changes: any): void {}

  return { items, save, findById, update };
}
