import { describe, expect, it } from 'vitest';
import { people } from '../data/people';
import { filterPeople } from './filterPeople';

describe('filterPeople', () => {
  it('keeps everybody for an empty or blank query', () => {
    expect(filterPeople(people, '')).toEqual(people);
    expect(filterPeople(people, '   ')).toEqual(people);
  });

  it('matches part of the name, ignoring case', () => {
    expect(filterPeople(people, 'SKY').map(({ name }) => name)).toEqual(['Luke Skywalker']);
  });

  it('returns nobody when nothing matches', () => {
    expect(filterPeople(people, 'Yoda')).toEqual([]);
  });
});
