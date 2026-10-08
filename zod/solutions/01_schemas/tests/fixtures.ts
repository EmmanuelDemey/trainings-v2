/**
 * A concert exactly as the API sends it — `tags` and `soldOut` left out on
 * purpose, and one key the app knows nothing about.
 */
export const apiConcert = {
  id: '7a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d',
  artist: 'Nina Simone Tribute',
  startsAt: '2026-11-14T20:30:00Z',
  venue: { name: 'La Cigale', city: 'Paris', capacity: 1400 },
  price: 42.5,
  internalScore: 0.87,
};

/** The same concert, with one field replaced. */
export function concertWith(patch: Record<string, unknown>) {
  return { ...apiConcert, ...patch };
}
