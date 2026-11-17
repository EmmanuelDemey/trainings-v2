// One book of the catalogue.
//
// TODO 2: its props are a book written by hand — a second description of a
// book, next to BookSchema, and already out of date. Take the `Book` inferred
// from the schema instead: a book as the API sends it must be refused.

export interface BookCardProps {
  book: { title: string; authors: string[]; publishedAt: string; price: number };
}

export function BookCard({ book }: BookCardProps) {
  return (
    <article aria-label={book.title}>
      <h2>{book.title}</h2>
      <p>
        {book.authors.join(', ')} — {new Date(book.publishedAt).getFullYear()}
      </p>
      <p>{book.price.toFixed(2)} €</p>
    </article>
  );
}
