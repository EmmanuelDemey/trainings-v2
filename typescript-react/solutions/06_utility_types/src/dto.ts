// The types the components exchange, derived from the model — never written twice.
import type { ComponentProps } from 'react';
import type { Book, GENRES, defaultSettings } from './model.ts';
import type { bookLoader } from './api.ts';
import type { BookStore } from './store.ts';
import type { useShelf } from './useShelf.ts';

/** One of the genres, read from the GENRES array. */
export type Genre = (typeof GENRES)[number];

/** The settings of the UI, read from their default value. */
export type Settings = typeof defaultSettings;

/** The values of the "new book" form: everything but the id, which the server assigns. */
export type BookFormValues = Omit<Book, 'id'>;

/** The state of the "edit book" form: any field but the id, each optional. */
export type BookDraft = Partial<Omit<Book, 'id'>>;

/** The props of <SubmitButton />: every prop of a <button> but `type`, which it owns. */
export type SubmitButtonProps = Omit<ComponentProps<'button'>, 'type'>;

/** A book once the server has filled in every optional field. */
export type CompleteBook = Required<Book>;

/** The props of <BookCard />: id, title, author. */
export type BookCardProps = Pick<Book, 'id' | 'title' | 'author'>;

/** A book the UI may display but not change. */
export type FrozenBook = Readonly<Book>;

/** How many books there are of each genre — every genre, always. */
export type GenreCount = Record<Genre, number>;

/** The genres a child may borrow. */
export type ChildGenre = Exclude<Genre, 'essay'>;

/** The genres with pictures. */
export type IllustratedGenre = Extract<Genre, 'comic' | 'poetry'>;

/** The summary, once we know there is one. */
export type Summary = NonNullable<Book['summary']>;

/** The values a field of Book can hold, some of them missing. */
export type BookValue = Book[keyof Book];

/** What bookLoader resolves to. */
export type LoaderData = Awaited<ReturnType<typeof bookLoader>>;

/** What bookLoader takes. */
export type LoaderArgs = Parameters<typeof bookLoader>;

/** What `new BookStore(...)` builds. */
export type Store = InstanceType<typeof BookStore>;

/** What useShelf returns. */
export type Shelf = ReturnType<typeof useShelf>;
