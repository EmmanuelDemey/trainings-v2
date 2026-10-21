// The types the API and the UI exchange, derived from the model — never written twice.
//
// Every type below is `unknown` for now. Replace each with a type DERIVED from
// src/model.ts, src/api.ts or src/store.ts: no field, no genre is ever typed by hand.
import type { Book, GENRES, defaultSettings } from './model.ts';
import type { fetchBook } from './api.ts';
import type { BookStore } from './store.ts';

// TODO 1: values become types

/** One of the genres, read from the GENRES array. */
export type Genre = unknown;

/** The settings of the UI, read from their default value. */
export type Settings = unknown;

// TODO 2: request bodies

/** The body of a POST: everything but the id, which the server assigns. */
export type CreateBookBody = unknown;

/** The body of a PATCH: any field but the id, each optional. */
export type UpdateBookBody = unknown;

// TODO 3: views of a book

/** A book once the server has filled in every optional field. */
export type CompleteBook = unknown;

/** The line of a search result: id, title, author. */
export type BookSummary = unknown;

/** A book the UI may display but not change. */
export type FrozenBook = unknown;

/** How many books there are of each genre — every genre, always. */
export type GenreCount = unknown;

// TODO 4: unions

/** The genres a child may borrow: every genre but essay. */
export type ChildGenre = unknown;

/** The genres with pictures: comic and poetry. */
export type IllustratedGenre = unknown;

/** The summary, once we know there is one. */
export type Summary = unknown;

/** The values a field of Book can hold, some of them missing. */
export type BookValue = unknown;

// TODO 5: functions and classes

/** What fetchBook resolves to. */
export type FetchedBook = unknown;

/** What fetchBook takes. */
export type FetchBookArgs = unknown;

/** What `new BookStore(...)` builds. */
export type Store = unknown;
