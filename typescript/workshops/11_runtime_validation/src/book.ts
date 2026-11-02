// A book as the catalogue API sends it: JSON, so `unknown` until a schema checks it.
import { z } from 'zod';

/** TODO 1: 13 digits — and a brand, so that only this schema can make an Isbn. */
export const IsbnSchema = z.string();
export type Isbn = string;

/**
 * TODO 1: every field of a book — read tests/fixtures.ts for one, and
 * tests/book.spec.ts for what each field accepts.
 */
export const BookSchema = z.object({
  id: z.number(),
});

/** TODO 2: what the API sends — inferred from BookSchema, not written twice. */
export type BookJson = unknown;
/** TODO 2: what the app works with, once checked. */
export type Book = unknown;

/** TODO 3: throws a ZodError when `input` is not a book. */
export function parseBook(input: unknown): Book {
  return input;
}

export type BooksResult =
  | { ok: true; books: Book[] }
  | { ok: false; issues: { path: string; message: string }[] };

/** TODO 3: never throws — a list of books, or what is wrong with it. */
export function tryParseBooks(input: unknown): BooksResult {
  return { ok: true, books: [] };
}
