// How many books of each genre — a genre without books counts 0.
import { useMemo } from 'react';
import { GENRES, type Book } from './model.ts';
import type { GenreCount } from './dto.ts';

export function useGenreCount(books: readonly Book[]): GenreCount {
  return useMemo(() => {
    const counts = Object.fromEntries(GENRES.map((genre) => [genre, 0])) as GenreCount;
    for (const book of books) counts[book.genre] += 1;
    return counts;
  }, [books]);
}
