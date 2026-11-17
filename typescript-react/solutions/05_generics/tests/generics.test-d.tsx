import { describe, expectTypeOf, test } from 'vitest';
import { DataTable } from '../src/DataTable.tsx';
import { Emitter, useEvent } from '../src/emitter.ts';
import { List } from '../src/List.tsx';
import { Select } from '../src/Select.tsx';
import { useCollection } from '../src/useCollection.ts';
import { useGroupBy } from '../src/useGroupBy.ts';
import { users, type User } from './fixtures.ts';

describe('List', () => {
  test('renderItem receives the type of the items', () => {
    <List
      items={users}
      getKey={(user) => user.id}
      renderItem={(user) => {
        expectTypeOf(user).toEqualTypeOf<User>();
        return user.name;
      }}
    />;
  });

  test('refuses a property the items do not have', () => {
    // @ts-expect-error — a user has no email
    <List items={users} getKey={(user) => user.id} renderItem={(user) => user.email} />;
  });
});

describe('DataTable', () => {
  test('types each cell by its column', () => {
    <DataTable
      rows={users}
      columns={['age', 'role']}
      getRowKey={(user) => user.id}
      renderCell={(value) => {
        expectTypeOf(value).toEqualTypeOf<number | 'admin' | 'member'>();
        return String(value);
      }}
    />;
  });

  test('refuses a column the rows do not have', () => {
    // @ts-expect-error — a user has no email
    <DataTable rows={users} columns={['name', 'email']} getRowKey={(user) => user.id} />;
  });
});

describe('useGroupBy', () => {
  test('types the groups by the key computed', () => {
    expectTypeOf(useGroupBy(users, (user) => user.role)).toEqualTypeOf<{ admin?: User[]; member?: User[] }>();
  });
});

describe('useCollection', () => {
  test('returns the entity type it stores', () => {
    const collection = useCollection<User>();
    expectTypeOf(collection.findById('u1')).toEqualTypeOf<User | undefined>();
    expectTypeOf(collection.items).toEqualTypeOf<readonly User[]>();
  });

  test('only stores entities with a string id', () => {
    // @ts-expect-error — no id
    useCollection<{ name: string }>();
  });

  test('cannot update the id, nor a field the entity does not have', () => {
    const collection = useCollection<User>();
    // @ts-expect-error — the id is not part of the changes
    collection.update('u1', { id: 'u2' });
    // @ts-expect-error — a user has no email
    collection.update('u1', { email: 'ada@example.com' });
  });
});

describe('Emitter and useEvent', () => {
  interface ShopEvents {
    added: { sku: string; quantity: number };
    cleared: undefined;
  }
  const emitter = new Emitter<ShopEvents>();

  test('types the payload of each event', () => {
    useEvent(emitter, 'added', (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ sku: string; quantity: number }>();
    });
  });

  test('refuses an unknown event, or the wrong payload', () => {
    // @ts-expect-error — no such event
    useEvent(emitter, 'removed', () => {});
    // @ts-expect-error — the quantity is missing
    emitter.emit('added', { sku: 'TS-7' });
  });
});

describe('Select', () => {
  test('onChange receives one of the options', () => {
    <Select
      label="Theme"
      options={['light', 'dark']}
      defaultValue="dark"
      onChange={(value) => expectTypeOf(value).toEqualTypeOf<'light' | 'dark'>()}
    />;
  });

  test('refuses a default value that is not an option', () => {
    // @ts-expect-error — 'blue' is not an option
    <Select label="Theme" options={['light', 'dark']} defaultValue="blue" />;
  });
});
