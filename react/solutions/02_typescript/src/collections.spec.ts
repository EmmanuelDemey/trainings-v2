import { describe, expect, it } from 'vitest';
import { people } from './data/people';
import { groupBy, indexById, pick, sortBy } from './collections';
import type { Person } from './model/person';

const [luke] = people;
const names = (list: { name: string }[]) => list.map(({ name }) => name);

describe('groupBy', () => {
  it('groups the items under the key the function returns', () => {
    const groups = groupBy(people, (person) => person.gender ?? 'unknown');

    expect(Object.keys(groups).sort()).toEqual(['female', 'male', 'n/a']);
    expect(names(groups.male ?? [])).toEqual(['Luke Skywalker', 'Darth Vader']);
  });

  it('works with any item type', () => {
    expect(groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd'))).toEqual({
      odd: [1, 3],
      even: [2, 4],
    });
  });

  it('returns an empty object for an empty list', () => {
    expect(groupBy([], () => 'any')).toEqual({});
  });
});

describe('pick', () => {
  it('keeps only the requested keys', () => {
    expect(pick(luke, ['name', 'height'])).toEqual({ name: 'Luke Skywalker', height: '172' });
  });

  it('leaves out a requested key the object does not have', () => {
    const rey: Person = { id: '9', name: 'Rey', films: [] };

    expect(pick(rey, ['name', 'mass'])).toEqual({ name: 'Rey' });
  });
});

describe('sortBy', () => {
  it('sorts by a text field, alphabetically', () => {
    expect(names(sortBy(people, 'name'))).toEqual([
      'C-3PO',
      'Darth Vader',
      'Leia Organa',
      'Luke Skywalker',
      'R2-D2',
    ]);
  });

  it('sorts numeric strings as numbers, not as text', () => {
    expect(names(sortBy(people, 'height'))).toEqual([
      'R2-D2',
      'Leia Organa',
      'C-3PO',
      'Luke Skywalker',
      'Darth Vader',
    ]);
  });

  it('puts the items without a value last', () => {
    const list = [{ name: 'A' }, { name: 'B', mass: '10' }];

    expect(sortBy(list, 'mass')).toEqual([{ name: 'B', mass: '10' }, { name: 'A' }]);
  });

  it('does not mutate the array it receives', () => {
    const copy = [...people];

    sortBy(people, 'name');

    expect(people).toEqual(copy);
  });
});

describe('indexById', () => {
  it('indexes the items by their id', () => {
    const index = indexById(people);

    expect(Object.keys(index)).toEqual(['1', '2', '3', '4', '5']);
    expect(index['4'].name).toBe('Darth Vader');
  });
});
