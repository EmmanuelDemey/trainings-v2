import { describe, expect, it } from 'vitest';
import { ConcertSchema, VenueSchema } from '../src/schemas/concert';
import { apiConcert, concertWith } from './fixtures';

/** The paths of the issues a payload raises, e.g. `['venue', 'capacity']`. */
function issuePaths(payload: unknown) {
  const result = ConcertSchema.safeParse(payload);
  return result.success ? [] : result.error.issues.map((issue) => issue.path);
}

describe('VenueSchema', () => {
  it('accepts a complete venue', () => {
    const venue = { name: 'La Cigale', city: 'Paris', capacity: 1400 };
    expect(VenueSchema.parse(venue)).toEqual(venue);
  });

  it('rejects an empty name', () => {
    expect(VenueSchema.safeParse({ name: '', city: 'Paris', capacity: 1400 }).success).toBe(false);
  });

  it('rejects a capacity that is not a whole number above zero', () => {
    expect(VenueSchema.safeParse({ name: 'A', city: 'B', capacity: 0 }).success).toBe(false);
    expect(VenueSchema.safeParse({ name: 'A', city: 'B', capacity: 12.5 }).success).toBe(false);
  });
});

describe('ConcertSchema', () => {
  it('applies the defaults of the missing fields', () => {
    expect(ConcertSchema.parse(apiConcert)).toMatchObject({ tags: [], soldOut: false });
  });

  it('strips the keys it does not know', () => {
    expect(ConcertSchema.parse(apiConcert)).not.toHaveProperty('internalScore');
  });

  it('accepts a concert without a website, and one with a valid URL', () => {
    expect(ConcertSchema.safeParse(apiConcert).success).toBe(true);
    expect(ConcertSchema.safeParse(concertWith({ website: 'https://lacigale.fr' })).success).toBe(true);
  });

  it('rejects an id that is not a UUID', () => {
    expect(issuePaths(concertWith({ id: '42' }))).toEqual([['id']]);
  });

  it('rejects a start date without a time', () => {
    expect(issuePaths(concertWith({ startsAt: '2026-11-14' }))).toEqual([['startsAt']]);
  });

  it('reports a broken venue field at its nested path', () => {
    const payload = concertWith({ venue: { name: 'La Cigale', city: 'Paris', capacity: -1 } });
    expect(issuePaths(payload)).toEqual([['venue', 'capacity']]);
  });

  it('rejects a negative price, and accepts a free concert', () => {
    expect(issuePaths(concertWith({ price: -1 }))).toEqual([['price']]);
    expect(issuePaths(concertWith({ price: 0 }))).toEqual([]);
  });

  it('rejects a website that is not a URL', () => {
    expect(issuePaths(concertWith({ website: 'lacigale' }))).toEqual([['website']]);
  });

  it('reports every broken field at once, not only the first one', () => {
    expect(issuePaths(concertWith({ id: '42', price: -1 }))).toEqual([['id'], ['price']]);
  });
});
