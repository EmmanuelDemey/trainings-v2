import type { MouseEventHandler } from 'react';
import { describe, expectTypeOf, test } from 'vitest';
import type * as dto from '../src/dto.ts';
import type { Book } from '../src/model.ts';
import type { BookStore } from '../src/store.ts';
import { SubmitButton } from '../src/SubmitButton.tsx';
import { BookCard } from '../src/BookCard.tsx';
import { maus } from './fixtures.ts';

describe('values become types', () => {
  test('Genre is read from the GENRES array', () => {
    expectTypeOf<dto.Genre>().toEqualTypeOf<'novel' | 'essay' | 'comic' | 'poetry'>();
  });

  test('Settings is read from the default settings', () => {
    expectTypeOf<dto.Settings>().toEqualTypeOf<{ pageSize: number; sortBy: string; showCovers: boolean }>();
  });
});

describe('form types', () => {
  test('BookFormValues is a book without its id', () => {
    expectTypeOf<dto.BookFormValues>().toEqualTypeOf<{
      title: string;
      author: string;
      genre: dto.Genre;
      publishedAt: Date;
      summary?: string;
      tags: string[];
    }>();
  });

  test('BookDraft has every field but the id, each optional', () => {
    expectTypeOf<dto.BookDraft>().toEqualTypeOf<{
      title?: string;
      author?: string;
      genre?: dto.Genre;
      publishedAt?: Date;
      summary?: string;
      tags?: string[];
    }>();
  });

  test('SubmitButton takes every prop of a button but type', () => {
    expectTypeOf<dto.SubmitButtonProps['onClick']>().toEqualTypeOf<MouseEventHandler<HTMLButtonElement> | undefined>();
    expectTypeOf<dto.SubmitButtonProps>().not.toHaveProperty('type');
    // @ts-expect-error — the type is owned by SubmitButton
    <SubmitButton type="reset" />;
  });
});

describe('views of a book', () => {
  test('CompleteBook has a summary, always', () => {
    expectTypeOf<dto.CompleteBook['summary']>().toEqualTypeOf<string>();
    expectTypeOf<dto.CompleteBook>().toHaveProperty('id');
  });

  test('BookCardProps keeps the id, the title and the author', () => {
    expectTypeOf<dto.BookCardProps>().toEqualTypeOf<{ id: string; title: string; author: string }>();
    // @ts-expect-error — the author is missing
    <BookCard id={maus.id} title={maus.title} />;
  });

  test('FrozenBook cannot be changed', () => {
    const book = {} as dto.FrozenBook;
    // @ts-expect-error — readonly
    book.title = 'Dune Messiah';
  });

  test('GenreCount has every genre, each a number', () => {
    expectTypeOf<dto.GenreCount>().toEqualTypeOf<{ novel: number; essay: number; comic: number; poetry: number }>();
  });
});

describe('unions', () => {
  test('ChildGenre is every genre but essay', () => {
    expectTypeOf<dto.ChildGenre>().toEqualTypeOf<'novel' | 'comic' | 'poetry'>();
  });

  test('IllustratedGenre is comic and poetry', () => {
    expectTypeOf<dto.IllustratedGenre>().toEqualTypeOf<'comic' | 'poetry'>();
  });

  test('Summary is a string, never undefined', () => {
    expectTypeOf<dto.Summary>().toEqualTypeOf<string>();
  });

  test('BookValue is the type of any field of a book', () => {
    expectTypeOf<dto.BookValue>().toEqualTypeOf<string | Date | string[] | undefined>();
  });
});

describe('functions, hooks and classes', () => {
  test('LoaderData is what bookLoader resolves to', () => {
    expectTypeOf<dto.LoaderData>().toEqualTypeOf<Book | undefined>();
  });

  test('LoaderArgs is what bookLoader takes', () => {
    expectTypeOf<dto.LoaderArgs>().toEqualTypeOf<[id: string, options?: { signal?: AbortSignal }]>();
  });

  test('Store is what new BookStore() builds', () => {
    expectTypeOf<dto.Store>().toEqualTypeOf<BookStore>();
  });

  test('Shelf is what useShelf returns', () => {
    expectTypeOf<dto.Shelf>().toEqualTypeOf<{ books: Book[]; add: (book: Book) => void }>();
  });
});
