import { describe, expectTypeOf, test } from 'vitest';
import { first, groupBy, pluck } from '../src/collections.ts';
import { Emitter } from '../src/emitter.ts';
import { Repository } from '../src/repository.ts';
import { createSelect } from '../src/select.ts';
import { users, type User } from './fixtures.ts';

describe('collections', () => {
  test('first keeps the type of the items', () => {
    expectTypeOf(first(users)).toEqualTypeOf<User | undefined>();
    expectTypeOf(first([1, 2, 3])).toEqualTypeOf<number | undefined>();
  });

  test('pluck types the values by the key read', () => {
    expectTypeOf(pluck(users, 'age')).toEqualTypeOf<number[]>();
    expectTypeOf(pluck(users, 'role')).toEqualTypeOf<('admin' | 'member')[]>();
  });

  test('pluck refuses a key the items do not have', () => {
    // @ts-expect-error — a user has no email
    pluck(users, 'email');
  });

  test('groupBy types the groups by the key computed', () => {
    expectTypeOf(groupBy(users, (user) => user.role)).toEqualTypeOf<{ admin?: User[]; member?: User[] }>();
  });
});

describe('Repository', () => {
  test('returns the entity type it stores', () => {
    const repository = new Repository<User>();
    expectTypeOf(repository.findById('u1')).toEqualTypeOf<User | undefined>();
    expectTypeOf(repository.findAll()).toEqualTypeOf<User[]>();
  });

  test('only stores entities with a string id', () => {
    // @ts-expect-error — no id
    new Repository<{ name: string }>();
  });

  test('cannot update the id, nor a field the entity does not have', () => {
    const repository = new Repository<User>();
    // @ts-expect-error — the id is not part of the changes
    repository.update('u1', { id: 'u2' });
    // @ts-expect-error — a user has no email
    repository.update('u1', { email: 'ada@example.com' });
  });
});

describe('Emitter', () => {
  interface ShopEvents {
    added: { sku: string; quantity: number };
    cleared: undefined;
  }

  test('types the payload of each event', () => {
    new Emitter<ShopEvents>().on('added', (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ sku: string; quantity: number }>();
    });
  });

  test('refuses an unknown event, or the wrong payload', () => {
    const emitter = new Emitter<ShopEvents>();
    // @ts-expect-error — no such event
    emitter.on('removed', () => {});
    // @ts-expect-error — the quantity is missing
    emitter.emit('added', { sku: 'TS-7' });
  });
});

describe('createSelect', () => {
  test('keeps the literal types of the options', () => {
    expectTypeOf(createSelect(['light', 'dark'], 'dark').selected).toEqualTypeOf<'light' | 'dark'>();
  });

  test('refuses an initial value that is not an option', () => {
    // @ts-expect-error — 'blue' is not an option
    createSelect(['light', 'dark'], 'blue');
  });
});
