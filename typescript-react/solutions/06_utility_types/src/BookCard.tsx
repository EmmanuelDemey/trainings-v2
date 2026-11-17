// The line of a search result — and nothing else, even if it is given a whole book.
import type { BookCardProps } from './dto.ts';

export function BookCard({ id, title, author }: BookCardProps) {
  return (
    <article data-id={id}>
      <h3>{title}</h3>
      <p>{author}</p>
    </article>
  );
}
