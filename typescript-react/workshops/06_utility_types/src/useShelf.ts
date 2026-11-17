// A custom hook whose return type is not exported: read it with ReturnType.
import { useState } from 'react';
import type { Book } from './model.ts';
import type { BookStore } from './store.ts';

export function useShelf(store: BookStore) {
  const [books, setBooks] = useState(store.books);
  const add = (book: Book) => setBooks((current) => [...current, book]);
  return { books, add };
}
