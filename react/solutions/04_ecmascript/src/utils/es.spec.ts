import { describe, expect, it } from 'vitest';
import { people } from '../data/people';
import type { Person } from '../model/person';
import {
  addFilm,
  addOneToLast,
  countMales,
  deepCopy,
  describeLast,
  describeMass,
  getAttr,
  getFirstKeys,
  getLength,
  getMassAverage,
  getNames,
  groupByGender,
  sortByHeight,
  uniqueEyeColors,
  withDefaults,
  withoutFilms,
} from './es';

const [luke] = people;
const names = (list: readonly Person[] = []) => list.map(({ name }) => name);
const everybody = ['Luke Skywalker', 'C-3PO', 'R2-D2', 'Darth Vader', 'Leia Organa'];

describe('arrays: map, filter, reduce', () => {
  it('counts the people', () => {
    expect(getLength(people)).toBe(5);
  });

  it('counts the males', () => {
    expect(countMales(people)).toBe(2);
  });

  it('returns the names, in order', () => {
    expect(getNames(people)).toEqual(everybody);
  });

  it('builds a reusable getter for any attribute', () => {
    expect(getAttr('name')(people)).toEqual(everybody);
    expect(getAttr('height')(people)).toEqual(['172', '167', '96', '202', '150']);
  });

  it('returns the keys of the first person', () => {
    const keys = getFirstKeys(people);

    expect(keys).toContain('name');
    expect(keys).toContain('id');
    expect(keys).not.toContain('dummy');
  });

  it('returns null instead of keys for an empty list', () => {
    expect(getFirstKeys([])).toBeNull();
  });

  it('describes every field of the last person as "key: value"', () => {
    const lines = describeLast(people);

    expect(lines).toContain('name: Leia Organa');
    expect(lines).toContain('skinColor: light');
    expect(describeLast([])).toBeNull();
  });

  it('computes the average mass', () => {
    expect(getMassAverage(people)).toBe(73.8);
  });

  it('has no average mass for an empty list, or when a mass is unknown', () => {
    expect(getMassAverage([])).toBeNull();
    expect(getMassAverage([...people, { id: '9', name: 'Rey', films: [] }])).toBeNull();
  });

  it('adds one to each numeric field of the last person, id excepted', () => {
    expect(addOneToLast(people)).toEqual({ height: '151', mass: '50' });
    expect(addOneToLast([])).toEqual({});
  });

  it('lists each eye colour once, in order of first appearance', () => {
    expect(uniqueEyeColors(people)).toEqual(['blue', 'yellow', 'red', 'brown']);
  });
});

describe('newer built-ins: groupBy, toSorted, structuredClone', () => {
  it('groups the people by gender', () => {
    const groups = groupByGender(people);

    expect(Object.keys(groups)).toEqual(['male', 'n/a', 'female']);
    expect(names(groups.male)).toEqual(['Luke Skywalker', 'Darth Vader']);
    expect(names(groups.female)).toEqual(['Leia Organa']);
  });

  it('puts the people without a gender under "unknown"', () => {
    const groups = groupByGender([{ id: '9', name: 'Rey', films: [] }]);

    expect(names(groups.unknown)).toEqual(['Rey']);
  });

  it('sorts by height, tallest first', () => {
    expect(names(sortByHeight(people))).toEqual([
      'Darth Vader',
      'Luke Skywalker',
      'C-3PO',
      'Leia Organa',
      'R2-D2',
    ]);
  });

  it('puts the unknown heights last', () => {
    const rey: Person = { id: '9', name: 'Rey', films: [] };

    expect(names(sortByHeight([rey, luke]))).toEqual(['Luke Skywalker', 'Rey']);
  });

  it('sorts a copy and leaves the original order alone', () => {
    const sorted = sortByHeight(people);

    expect(sorted).not.toBe(people);
    expect(getNames(people)).toEqual(everybody);
  });

  it('makes a deep copy, nested arrays included', () => {
    const copy = deepCopy(luke);
    copy.films.push('The Force Awakens');

    expect(copy).not.toBe(luke);
    expect(luke.films).toHaveLength(4);
  });
});

describe('objects: rest, spread, ?. and ??', () => {
  it('removes the films and keeps every other field', () => {
    const rest = withoutFilms(luke);

    expect(rest).not.toHaveProperty('films');
    expect(rest).toMatchObject({ id: '1', name: 'Luke Skywalker', height: '172' });
  });

  it('fills the missing fields with defaults', () => {
    expect(withDefaults({ id: '9', name: 'Rey' })).toEqual({
      id: '9',
      name: 'Rey',
      films: [],
      gender: 'n/a',
    });
  });

  it('lets the given fields win over the defaults', () => {
    expect(withDefaults({ id: '9', name: 'Rey', gender: 'female' }).gender).toBe('female');
  });

  it('adds a film to a copy, never to the original', () => {
    const updated = addFilm(luke, 'The Force Awakens');

    expect(updated.films).toHaveLength(5);
    expect(updated.films.at(-1)).toBe('The Force Awakens');
    expect(luke.films).toHaveLength(4);
  });

  it('describes the mass of a person who may be missing', () => {
    expect(describeMass(luke)).toBe('77');
    expect(describeMass(undefined)).toBe('unknown');
    expect(describeMass({ id: '9', name: 'Rey', films: [] })).toBe('unknown');
  });

  it('keeps an empty mass instead of replacing it — `??`, not `||`', () => {
    expect(describeMass({ id: '9', name: 'Rey', films: [], mass: '' })).toBe('');
  });
});
