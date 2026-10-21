// The runtime half: functions whose signatures use the derived types.
//
// TODO 6: once src/dto.ts is done, type each parameter with the right DTO, and
// implement the four functions.
import { GENRES, type Book } from './model.ts';

/** A new book, with the id the server assigned. */
export function createBook(id: string, body: any): Book {
  return body;
}

/** The book, with the changes applied. The original is left untouched. */
export function applyPatch(book: Book, patch: any): Book {
  return book;
}

/** The line of a search result — and nothing else, even if `book` has more. */
export function toSummary(book: any): any {
  return book;
}

/** How many books of each genre — a genre without books counts 0. */
export function countByGenre(books: readonly Book[]): any {
  return {};
}
