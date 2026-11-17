// The types the components exchange, derived from the model — never written twice.
//
// Every type below is `unknown` for now. Replace each with a type DERIVED from
// src/model.ts, src/api.ts, src/store.ts, src/useShelf.ts or React's own types:
// no field, no genre, no prop of a <button> is ever typed by hand.
import type { ComponentProps } from 'react';
import type { Book, GENRES, defaultSettings } from './model.ts';
import type { bookLoader } from './api.ts';
import type { BookStore } from './store.ts';
import type { useShelf } from './useShelf.ts';

// TODO 1: values become types

/** One of the genres, read from the GENRES array. */
export type Genre = unknown;

/** The settings of the UI, read from their default value. */
export type Settings = unknown;

// TODO 2: form types

/** The values of the "new book" form: everything but the id, which the server assigns. */
export type BookFormValues = unknown;

/** The state of the "edit book" form: any field but the id, each optional. */
export type BookDraft = unknown;

/** The props of <SubmitButton />: every prop of a <button> but `type`, which it owns. */
export type SubmitButtonProps = unknown;

// TODO 3: views of a book

/** A book once the server has filled in every optional field. */
export type CompleteBook = unknown;

/** The props of <BookCard />: id, title, author. */
export type BookCardProps = unknown;

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

// TODO 5: functions, hooks and classes

/** What bookLoader resolves to. */
export type LoaderData = unknown;

/** What bookLoader takes. */
export type LoaderArgs = unknown;

/** What `new BookStore(...)` builds. */
export type Store = unknown;

/** What useShelf returns. */
export type Shelf = unknown;
