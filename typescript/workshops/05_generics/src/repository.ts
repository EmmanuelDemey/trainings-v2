// An in-memory store, for any entity that carries a string `id`.

export interface Entity {
  id: string;
}

/**
 * TODO 4: make it generic — `Repository<User>` stores users, and only an
 * entity with a string `id` can be stored.
 */
export class Repository<T = any> {
  readonly #items = new Map<string, any>();

  /** Stores the entity, replacing the one with the same id. */
  save(entity: any): any {
    return entity;
  }

  findById(id: string): any {
    return undefined;
  }

  findAll(): any[] {
    return [];
  }

  /** TODO 5: merges `changes` into the stored entity. The id cannot change. Throws when the id is unknown. */
  update(id: string, changes: any): any {
    return changes;
  }
}
