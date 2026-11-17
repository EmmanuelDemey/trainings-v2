// One book of the catalogue. Its props are inferred from the schema: a book as
// the API sends it — a date as a string, an ISBN not checked — is refused.
import type { Book } from './book.ts';

export interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <article aria-label={book.title}>
      <h2>{book.title}</h2>
      <p>
        {book.authors.join(', ')} — {book.publishedAt.getFullYear()}
      </p>
      <p>{book.price.toFixed(2)} €</p>
    </article>
  );
}
