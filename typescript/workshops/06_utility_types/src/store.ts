import type { Book } from './model.ts';

export class BookStore {
  readonly books: Book[];

  constructor(books: Book[] = []) {
    this.books = books;
  }
}
