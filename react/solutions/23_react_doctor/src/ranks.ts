const RANKS = [
  { from: 0, title: 'Youngling' },
  { from: 3, title: 'Padawan' },
  { from: 6, title: 'Knight' },
  { from: 10, title: 'Master' },
] as const;

export type Rank = (typeof RANKS)[number]['title'];

/** The rank a given number of training points earns. */
export function rankFor(points: number): Rank {
  return RANKS.findLast((rank) => points >= rank.from)?.title ?? 'Youngling';
}
