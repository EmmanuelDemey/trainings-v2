import { describe, expect, it } from 'vitest';
import { ConcertPatchSchema, ConcertSummarySchema, NewConcertSchema } from '../src/schemas/derived';
import { concert } from './fixtures';

describe('NewConcertSchema', () => {
  it('accepts a concert without an id', () => {
    const { id: _id, ...withoutId } = concert;
    expect(NewConcertSchema.safeParse(withoutId).success).toBe(true);
  });

  it('strips an id sent by the client', () => {
    expect(NewConcertSchema.parse(concert)).not.toHaveProperty('id');
  });

  it('keeps every other rule of the concert', () => {
    expect(NewConcertSchema.safeParse({ ...concert, price: -1 }).success).toBe(false);
  });
});

describe('ConcertPatchSchema', () => {
  it('accepts a patch of a single field', () => {
    expect(ConcertPatchSchema.parse({ price: 30 })).toEqual({ price: 30 });
  });

  it('turns an empty patch into an empty object — no default sneaks in', () => {
    expect(ConcertPatchSchema.parse({})).toEqual({});
  });

  it('still validates the fields it is given', () => {
    expect(ConcertPatchSchema.safeParse({ price: -1 }).success).toBe(false);
    expect(ConcertPatchSchema.safeParse({ venue: { name: 'X' } }).success).toBe(false);
  });

  it('cannot change the id', () => {
    expect(ConcertPatchSchema.parse({ id: 'other', artist: 'Fela' })).toEqual({ artist: 'Fela' });
  });
});

describe('ConcertSummarySchema', () => {
  it('keeps only the id, the artist and the date', () => {
    expect(ConcertSummarySchema.parse(concert)).toEqual({
      id: concert.id,
      artist: concert.artist,
      startsAt: concert.startsAt,
    });
  });
});
