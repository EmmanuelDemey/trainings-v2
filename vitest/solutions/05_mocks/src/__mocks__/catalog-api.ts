// Picked up by `vi.mock('../src/catalog-api')` with no factory: a catalog of two
// books, the same in every spec file that asks for it.
import { vi } from 'vitest';
import type { BookInfo } from '../catalog-api';

const books: Record<string, BookInfo> = {
  '9780132350884': { isbn: '9780132350884', title: 'Clean Code', priceInCents: 3990 },
  '9782070360024': { isbn: '9782070360024', title: "L'Étranger", priceInCents: 790 },
};

export const fetchBook = vi.fn(async (isbn: string) => {
  const book = books[isbn];
  if (!book) throw new Error(`No book with ISBN ${isbn}`);
  return book;
});
