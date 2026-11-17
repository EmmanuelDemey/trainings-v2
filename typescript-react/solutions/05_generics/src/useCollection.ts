// The state of a list of entities — any entity that carries a string `id`.
import { useState } from 'react';

export interface Entity {
  id: string;
}

export function useCollection<T extends Entity>(initial: readonly T[] = []) {
  const [items, setItems] = useState<readonly T[]>(initial);

  /** Stores the entity, replacing the one with the same id. */
  function save(entity: T): void {
    setItems((current) =>
      current.some((item) => item.id === entity.id)
        ? current.map((item) => (item.id === entity.id ? entity : item))
        : [...current, entity],
    );
  }

  function findById(id: string): T | undefined {
    return items.find((item) => item.id === id);
  }

  /** Merges `changes` into the stored entity. The id cannot change. Throws when the id is unknown. */
  function update(id: string, changes: Partial<Omit<T, 'id'>>): void {
    const current = findById(id);
    if (current === undefined) throw new Error(`No entity with id ${id}`);
    save({ ...current, ...changes, id });
  }

  return { items, save, findById, update };
}
