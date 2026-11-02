// A book as the catalogue API sends it: JSON, so `unknown` until a schema checks it.
import { z } from 'zod';

export const IsbnSchema = z.string().regex(/^\d{13}$/).brand<'Isbn'>();
export type Isbn = z.infer<typeof IsbnSchema>;

export const BookSchema = z.object({
  id: z.int().positive(),
  isbn: IsbnSchema,
  title: z.string().trim().min(1),
  authors: z.array(z.string()).min(1),
  publishedAt: z.iso.date().transform((date) => new Date(date)),
  price: z.number().nonnegative(),
  cover: z.url({ protocol: /^https$/ }).optional(),
});

/** What the API sends. */
export type BookJson = z.input<typeof BookSchema>;
/** What the app works with, once checked. */
export type Book = z.output<typeof BookSchema>;

/** Throws a ZodError when `input` is not a book. */
export function parseBook(input: unknown): Book {
  return BookSchema.parse(input);
}

export type BooksResult =
  | { ok: true; books: Book[] }
  | { ok: false; issues: { path: string; message: string }[] };

/** Never throws: a list of books, or what is wrong with it. */
export function tryParseBooks(input: unknown): BooksResult {
  const result = z.array(BookSchema).safeParse(input);
  if (result.success) return { ok: true, books: result.data };
  return {
    ok: false,
    issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  };
}
