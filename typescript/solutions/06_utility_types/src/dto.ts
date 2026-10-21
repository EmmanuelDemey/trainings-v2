// The types the API and the UI exchange, derived from the model — never written twice.
import type { Book, GENRES, defaultSettings } from './model.ts';
import type { fetchBook } from './api.ts';
import type { BookStore } from './store.ts';

/** One of the genres, read from the GENRES array. */
export type Genre = (typeof GENRES)[number];

/** The body of a POST: everything but the id, which the server assigns. */
export type CreateBookBody = Omit<Book, 'id'>;

/** The body of a PATCH: any field but the id, each optional. */
export type UpdateBookBody = Partial<Omit<Book, 'id'>>;

/** A book once the server has filled in every optional field. */
export type CompleteBook = Required<Book>;

/** The line of a search result: id, title, author. */
export type BookSummary = Pick<Book, 'id' | 'title' | 'author'>;

/** A book the UI may display but not change. */
export type FrozenBook = Readonly<Book>;

/** How many books there are of each genre — every genre, always. */
export type GenreCount = Record<Genre, number>;

/** The genres a child may borrow. */
export type ChildGenre = Exclude<Genre, 'essay'>;

/** The genres with pictures. */
export type IllustratedGenre = Extract<Genre, 'comic' | 'poetry'>;

/** The settings of the UI, read from their default value. */
export type Settings = typeof defaultSettings;

/** What fetchBook resolves to. */
export type FetchedBook = Awaited<ReturnType<typeof fetchBook>>;

/** What fetchBook takes. */
export type FetchBookArgs = Parameters<typeof fetchBook>;

/** What `new BookStore(...)` builds. */
export type Store = InstanceType<typeof BookStore>;

/** The values a field of Book can hold, some of them missing. */
export type BookValue = Book[keyof Book];

/** The summary, once we know there is one. */
export type Summary = NonNullable<Book['summary']>;
