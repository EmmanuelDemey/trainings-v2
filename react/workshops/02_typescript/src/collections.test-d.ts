import { describe, expectTypeOf, it } from 'vitest';
import { people } from './data/people';
import { groupBy, indexById, pick, sortBy } from './collections';
import type { Gender, Person } from './model/person';

const [luke] = people;

describe('groupBy', () => {
  it('infers the keys and the items from its arguments', () => {
    expectTypeOf(groupBy(people, (person) => person.gender ?? 'unknown')).toEqualTypeOf<
      Partial<Record<Gender | 'unknown', Person[]>>
    >();
    expectTypeOf(groupBy([1, 2], (n) => (n > 1 ? 'big' : 'small'))).toEqualTypeOf<
      Partial<Record<'big' | 'small', number[]>>
    >();
  });
});

describe('pick', () => {
  it('returns a Pick of the requested keys', () => {
    expectTypeOf(pick(luke, ['name', 'height'])).toEqualTypeOf<Pick<Person, 'name' | 'height'>>();
  });

  it('only accepts keys of the object', () => {
    // @ts-expect-error — `nmae` is not a key of Person
    pick(luke, ['nmae']);
  });
});

describe('sortBy', () => {
  it('returns an array of the same item type', () => {
    expectTypeOf(sortBy(people, 'name')).toEqualTypeOf<Person[]>();
  });

  it('only accepts keys of the items', () => {
    // @ts-expect-error — people have no `age`
    sortBy(people, 'age');
  });
});

describe('indexById', () => {
  it('maps ids to the item type', () => {
    expectTypeOf(indexById(people)).toEqualTypeOf<Record<string, Person>>();
  });

  it('only accepts items with a string id', () => {
    // @ts-expect-error — numbers have no id
    indexById([1, 2, 3]);
  });
});
