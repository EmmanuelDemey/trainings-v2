import { describe, expect, it } from 'vitest';
import { peopleKeys, peopleQuery, personQuery } from './people';

describe('step 2 — the query-key factory', () => {
  it('builds hierarchical keys, from the most general to the most precise', () => {
    expect(peopleKeys.all).toEqual(['people']);
    expect(peopleKeys.lists()).toEqual(['people', 'list']);
    expect(peopleKeys.details()).toEqual(['people', 'detail']);
    expect(peopleKeys.detail('1')).toEqual(['people', 'detail', '1']);
  });

  it('gives each person a key of its own', () => {
    expect(peopleKeys.detail('1')).not.toEqual(peopleKeys.detail('2'));
  });

  it('uses the factory in the query options, never a hand-typed key', () => {
    expect(peopleQuery().queryKey).toEqual(peopleKeys.lists());
    expect(personQuery('3').queryKey).toEqual(peopleKeys.detail('3'));
  });
});
