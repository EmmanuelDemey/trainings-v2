// An in-memory store, for any entity that carries a string `id`.

export interface Entity {
  id: string;
}

export class Repository<T extends Entity> {
  readonly #items = new Map<string, T>();

  /** Stores the entity, replacing the one with the same id. */
  save(entity: T): T {
    this.#items.set(entity.id, entity);
    return entity;
  }

  findById(id: string): T | undefined {
    return this.#items.get(id);
  }

  findAll(): T[] {
    return [...this.#items.values()];
  }

  /** Merges `changes` into the stored entity. The id cannot change. Throws when the id is unknown. */
  update(id: string, changes: Partial<Omit<T, 'id'>>): T {
    const current = this.findById(id);
    if (current === undefined) throw new Error(`No entity with id ${id}`);
    return this.save({ ...current, ...changes, id });
  }
}
