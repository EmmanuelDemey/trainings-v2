import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { parseBook, tryParseBooks } from '../src/book.ts';
import { dune } from './fixtures.ts';

describe('parseBook', () => {
  test('accepts a book as the API sends it', () => {
    expect(parseBook(JSON.parse(JSON.stringify(dune)))).toEqual({ ...dune, publishedAt: new Date('1965-08-01') });
  });

  test('turns the publication date into a Date', () => {
    expect(parseBook(dune)).toMatchObject({ publishedAt: expect.any(Date) });
  });

  test('trims the title', () => {
    expect(parseBook({ ...dune, title: '  Dune ' })).toMatchObject({ title: 'Dune' });
  });

  test('accepts a book without a cover', () => {
    const { cover: _cover, ...rest } = dune;
    expect(parseBook(rest)).not.toHaveProperty('cover');
  });

  test('drops the fields a book does not have', () => {
    expect(parseBook({ ...dune, stock: 3 })).not.toHaveProperty('stock');
  });

  test.each([
    ['an id of 0', { ...dune, id: 0 }],
    ['an id that is not an integer', { ...dune, id: 1.5 }],
    ['an ISBN of 10 digits', { ...dune, isbn: '0441172717' }],
    ['a blank title', { ...dune, title: '   ' }],
    ['a book with no author', { ...dune, authors: [] }],
    ['a date that does not exist', { ...dune, publishedAt: '1965-13-01' }],
    ['a negative price', { ...dune, price: -1 }],
    ['a price sent as a string', { ...dune, price: '9.99' }],
    ['an http cover', { ...dune, cover: 'http://covers.books.dev/dune.jpg' }],
  ])('refuses %s', (_label, input) => {
    expect(() => parseBook(input)).toThrow(z.ZodError);
  });
});

describe('tryParseBooks', () => {
  test('returns the books when every one is valid', () => {
    expect(tryParseBooks([dune, { ...dune, id: 2 }])).toEqual({
      ok: true,
      books: [parseBook(dune), parseBook({ ...dune, id: 2 })],
    });
  });

  test('lists every issue, with its path', () => {
    const result = tryParseBooks([dune, { ...dune, price: -1 }, { ...dune, title: '' }]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.path)).toEqual(['1.price', '2.title']);
  });

  test('says so when it is not a list at all', () => {
    expect(tryParseBooks({ books: [dune] })).toMatchObject({ ok: false, issues: [{ path: '' }] });
  });
});
