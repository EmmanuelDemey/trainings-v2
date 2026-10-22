// The specs of the matchers themselves: what they accept, what they refuse,
// and what they say when they fail.
import { stripVTControlCharacters } from 'node:util';
import { describe, expect, test } from 'vitest';
import type { Receipt } from '../src/receipt';

/** The message `assertion` fails with, without the colours of `printReceived`. */
function failureOf(assertion: () => void): string {
  try {
    assertion();
  } catch (error) {
    return stripVTControlCharacters((error as Error).message);
  }
  throw new Error('the assertion did not fail');
}

describe('toBeValidIsbn', () => {
  test.each(['9780132350884', '978-0-13-235088-4', '978 2 07 036002 4'])('accepts %s', (isbn) => {
    expect(isbn).toBeValidIsbn();
  });

  test.each(['9780132350885', '978013235088', 'not an isbn', 9780132350884])('refuses %s', (isbn) => {
    expect(isbn).not.toBeValidIsbn();
  });

  test('names the value it refused', () => {
    expect(failureOf(() => expect('123').toBeValidIsbn())).toBe('expected "123" to be a valid ISBN-13');
  });

  test('says "not" when it fails under .not', () => {
    expect(failureOf(() => expect('9780132350884').not.toBeValidIsbn())).toBe('expected "9780132350884" not to be a valid ISBN-13');
  });

  test('works as an asymmetric matcher, inside toEqual', () => {
    expect({ isbn: '9780132350884', title: 'Clean Code' }).toEqual({
      isbn: expect.toBeValidIsbn(),
      title: 'Clean Code',
    });
  });
});

describe('toTotal', () => {
  const receipt: Receipt = {
    lines: [
      { isbn: '9780132350884', title: 'Clean Code', quantity: 2, priceInCents: 3990 },
      { isbn: '9782070360024', title: "L'Étranger", quantity: 1, priceInCents: 790 },
    ],
    totalInCents: 8770,
  };

  test('passes on the right total', () => {
    expect(receipt).toTotal(8770);
  });

  test('fails on another total, and says both', () => {
    expect(failureOf(() => expect(receipt).toTotal(8000))).toBe('expected the receipt to total 8000, it totals 8770');
  });

  test('passes under .not on another total', () => {
    expect(receipt).not.toTotal(8000);
  });

  test('fails when the total contradicts the lines — even under .not', () => {
    const wrong = { ...receipt, totalInCents: 8000 };

    expect(failureOf(() => expect(wrong).toTotal(8000))).toBe('the receipt says 8000 but its lines add up to 8770');
    expect(failureOf(() => expect(wrong).not.toTotal(1))).toBe('the receipt says 8000 but its lines add up to 8770');
  });
});
