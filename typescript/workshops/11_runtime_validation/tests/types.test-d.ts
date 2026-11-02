import { describe, expectTypeOf, test } from 'vitest';
import type { Book, BookJson, Isbn } from '../src/book.ts';
import { BookSchema } from '../src/book.ts';
import type { Config } from '../src/config.ts';
import { validate } from '../src/validate.ts';
import { evenNumber } from './fixtures.ts';

describe('Book', () => {
  test('is inferred from its schema', () => {
    expectTypeOf<Book['authors']>().toEqualTypeOf<string[]>();
    expectTypeOf<Book['cover']>().toEqualTypeOf<string | undefined>();
  });

  test('has a Date once parsed, a string as sent', () => {
    expectTypeOf<Book['publishedAt']>().toEqualTypeOf<Date>();
    expectTypeOf<BookJson['publishedAt']>().toEqualTypeOf<string>();
  });

  test('has an ISBN that only the schema can make', () => {
    expectTypeOf<Book['isbn']>().toEqualTypeOf<Isbn>();
    // @ts-expect-error — a plain string is not an Isbn
    const _isbn: Isbn = '9780441172719';
  });
});

describe('Config', () => {
  test('is typed once parsed: numbers, booleans, literals', () => {
    expectTypeOf<Config>().toEqualTypeOf<{
      PORT: number;
      API_URL: string;
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      CACHE: boolean;
    }>();
  });
});

describe('validate', () => {
  test('returns the output type of the schema it is given', () => {
    expectTypeOf(validate(BookSchema, null)).resolves.toEqualTypeOf<Book>();
    expectTypeOf(validate(evenNumber, null)).resolves.toEqualTypeOf<number>();
  });
});
