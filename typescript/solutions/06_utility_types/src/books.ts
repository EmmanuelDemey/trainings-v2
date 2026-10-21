// The runtime half: functions whose signatures use the derived types.
import { GENRES, type Book } from './model.ts';
import type { BookSummary, CreateBookBody, GenreCount, UpdateBookBody } from './dto.ts';

/** A new book, with the id the server assigned. */
export function createBook(id: string, body: CreateBookBody): Book {
  return { ...body, id };
}

/** The book, with the changes applied. The original is left untouched. */
export function applyPatch(book: Book, patch: UpdateBookBody): Book {
  return { ...book, ...patch };
}

/** The line of a search result — and nothing else, even if `book` has more. */
export function toSummary({ id, title, author }: BookSummary): BookSummary {
  return { id, title, author };
}

/** How many books of each genre — a genre without books counts 0. */
export function countByGenre(books: readonly Book[]): GenreCount {
  const counts = Object.fromEntries(GENRES.map((genre) => [genre, 0])) as GenreCount;
  for (const book of books) counts[book.genre] += 1;
  return counts;
}
