import { describe, expect, test } from 'vitest';
import { applyPatch, countByGenre, createBook, toSummary } from '../src/books.ts';
import { dune, maus } from './fixtures.ts';

describe('createBook', () => {
  test('adds the id to the body', () => {
    const { id, ...body } = dune;
    expect(createBook('b1', body)).toEqual(dune);
  });
});

describe('applyPatch', () => {
  test('applies the changes', () => {
    expect(applyPatch(dune, { title: 'Dune Messiah' }).title).toBe('Dune Messiah');
  });

  test('keeps the fields the patch does not mention', () => {
    expect(applyPatch(dune, { title: 'Dune Messiah' }).author).toBe('Frank Herbert');
  });

  test('leaves the original book untouched', () => {
    applyPatch(dune, { title: 'Dune Messiah' });
    expect(dune.title).toBe('Dune');
  });
});

describe('toSummary', () => {
  test('keeps the id, the title and the author only', () => {
    expect(toSummary(maus)).toEqual({ id: 'b2', title: 'Maus', author: 'Art Spiegelman' });
  });
});

describe('countByGenre', () => {
  test('counts the books of every genre, 0 when there is none', () => {
    expect(countByGenre([dune, maus, dune])).toEqual({ novel: 2, essay: 0, comic: 1, poetry: 0 });
  });
});
