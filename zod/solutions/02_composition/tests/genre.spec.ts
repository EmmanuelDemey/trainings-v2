import { describe, expect, it } from 'vitest';
import { GenreSchema } from '../src/schemas/genre';

const jazz = {
  name: 'jazz',
  subgenres: [
    { name: 'bebop', subgenres: [{ name: 'hard bop', subgenres: [] }] },
    { name: 'swing', subgenres: [] },
  ],
};

describe('GenreSchema', () => {
  it('accepts a leaf genre', () => {
    expect(GenreSchema.parse({ name: 'reggae', subgenres: [] })).toEqual({ name: 'reggae', subgenres: [] });
  });

  it('accepts a tree, however deep', () => {
    expect(GenreSchema.parse(jazz)).toEqual(jazz);
  });

  it('reports a broken genre deep in the tree at its full path', () => {
    const broken = { name: 'jazz', subgenres: [{ name: 'bebop', subgenres: [{ name: '', subgenres: [] }] }] };
    const result = GenreSchema.safeParse(broken);
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([['subgenres', 0, 'subgenres', 0, 'name']]);
  });
});
