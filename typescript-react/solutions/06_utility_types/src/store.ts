import type { Book } from './model.ts';

/** The books the app has loaded, shared by every component. */
export class BookStore {
  readonly books: Book[];

  constructor(books: Book[] = []) {
    this.books = books;
  }
}
