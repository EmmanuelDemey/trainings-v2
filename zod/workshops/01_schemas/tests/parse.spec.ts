import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { parseConcert, partitionConcerts } from '../src/parse';
import { apiConcert, concertWith } from './fixtures';

describe('parseConcert', () => {
  it('returns the parsed concert, defaults applied', () => {
    expect(parseConcert(apiConcert)).toEqual({
      id: '7a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d',
      artist: 'Nina Simone Tribute',
      startsAt: '2026-11-14T20:30:00Z',
      venue: { name: 'La Cigale', city: 'Paris', capacity: 1400 },
      price: 42.5,
      tags: [],
      soldOut: false,
    });
  });

  it('throws a ZodError on a payload that does not match', () => {
    expect(() => parseConcert(concertWith({ price: 'free' }))).toThrow(ZodError);
  });

  it('throws on something that is not even an object', () => {
    expect(() => parseConcert(null)).toThrow(ZodError);
  });
});

describe('partitionConcerts', () => {
  it('keeps the valid entries and reports the broken ones with their index', () => {
    const feed = [apiConcert, concertWith({ id: 'nope' }), concertWith({ artist: 'Fela' }), 'garbage'];

    const { valid, rejected } = partitionConcerts(feed);

    expect(valid).toEqual([
      expect.objectContaining({ artist: 'Nina Simone Tribute' }),
      expect.objectContaining({ artist: 'Fela' }),
    ]);
    expect(rejected.map((entry) => entry.index)).toEqual([1, 3]);
  });

  it('says why each entry was rejected', () => {
    const { rejected } = partitionConcerts([concertWith({ id: 'nope' })]);

    expect(rejected[0]?.issues.map((issue) => issue.path)).toEqual([['id']]);
  });

  it('never throws, even on an empty or fully broken feed', () => {
    expect(partitionConcerts([])).toEqual({ valid: [], rejected: [] });
    expect(partitionConcerts([1, 2]).rejected).toHaveLength(2);
  });
});
