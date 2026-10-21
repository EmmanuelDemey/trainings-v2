import { describe, expectTypeOf, test } from 'vitest';
import type * as dto from '../src/dto.ts';
import type { Book } from '../src/model.ts';
import type { BookStore } from '../src/store.ts';

describe('values become types', () => {
  test('Genre is read from the GENRES array', () => {
    expectTypeOf<dto.Genre>().toEqualTypeOf<'novel' | 'essay' | 'comic' | 'poetry'>();
  });

  test('Settings is read from the default settings', () => {
    expectTypeOf<dto.Settings>().toEqualTypeOf<{ pageSize: number; sortBy: string; showCovers: boolean }>();
  });
});

describe('request bodies', () => {
  test('CreateBookBody is a book without its id', () => {
    expectTypeOf<dto.CreateBookBody>().toEqualTypeOf<{
      title: string;
      author: string;
      genre: dto.Genre;
      publishedAt: Date;
      summary?: string;
      tags: string[];
    }>();
  });

  test('UpdateBookBody has every field but the id, each optional', () => {
    expectTypeOf<dto.UpdateBookBody>().toEqualTypeOf<{
      title?: string;
      author?: string;
      genre?: dto.Genre;
      publishedAt?: Date;
      summary?: string;
      tags?: string[];
    }>();
  });
});

describe('views of a book', () => {
  test('CompleteBook has a summary, always', () => {
    expectTypeOf<dto.CompleteBook['summary']>().toEqualTypeOf<string>();
    expectTypeOf<dto.CompleteBook>().toHaveProperty('id');
  });

  test('BookSummary keeps the id, the title and the author', () => {
    expectTypeOf<dto.BookSummary>().toEqualTypeOf<{ id: string; title: string; author: string }>();
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

describe('functions and classes', () => {
  test('FetchedBook is what fetchBook resolves to', () => {
    expectTypeOf<dto.FetchedBook>().toEqualTypeOf<Book | undefined>();
  });

  test('FetchBookArgs is what fetchBook takes', () => {
    expectTypeOf<dto.FetchBookArgs>().toEqualTypeOf<[id: string, options?: { signal?: AbortSignal }]>();
  });

  test('Store is what new BookStore() builds', () => {
    expectTypeOf<dto.Store>().toEqualTypeOf<BookStore>();
  });
});
