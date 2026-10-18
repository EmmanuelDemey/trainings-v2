import { describe, expect, it } from 'vitest';
import { people } from '../data/people';
import { filterPeople } from './filterPeople';

const names = (list: { name: string }[]) => list.map(({ name }) => name);

describe('filterPeople', () => {
  it('keeps the people whose name contains the query', () => {
    expect(names(filterPeople(people, 'Sky'))).toEqual(['Luke Skywalker']);
  });

  it('ignores the case', () => {
    expect(names(filterPeople(people, 'dARTh'))).toEqual(['Darth Vader']);
  });

  it('ignores the spaces around the query', () => {
    expect(names(filterPeople(people, '  leia '))).toEqual(['Leia Organa']);
  });

  it('returns everybody for an empty query', () => {
    expect(filterPeople(people, '')).toEqual(people);
  });

  it('returns an empty list when nobody matches', () => {
    expect(filterPeople(people, 'Yoda')).toEqual([]);
  });

  it('returns a new array, never the one it received', () => {
    expect(filterPeople(people, '')).not.toBe(people);
  });
});
