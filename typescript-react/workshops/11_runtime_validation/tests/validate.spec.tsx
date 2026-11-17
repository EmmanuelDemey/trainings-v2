import { describe, expect, test } from 'vitest';
import { BookSchema, parseBook } from '../src/book.ts';
import { ValidationError, validate } from '../src/validate.ts';
import { dune, evenNumber, slowEvenNumber } from './fixtures.ts';

describe('validate', () => {
  test('returns the output of a Zod schema', async () => {
    await expect(validate(BookSchema, dune)).resolves.toEqual(parseBook(dune));
  });

  test('throws a ValidationError holding the issues', async () => {
    const error = await validate(BookSchema, { ...dune, price: -1 }).catch((error: unknown) => error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ issues: [{ path: ['price'] }] });
  });

  test('works with a schema written by hand', async () => {
    await expect(validate(evenNumber, 4)).resolves.toBe(4);
    await expect(validate(evenNumber, 3)).rejects.toThrow('Not an even number');
  });

  test('waits for a schema that answers later', async () => {
    await expect(validate(slowEvenNumber, 4)).resolves.toBe(4);
    await expect(validate(slowEvenNumber, 3)).rejects.toThrow(ValidationError);
  });
});
