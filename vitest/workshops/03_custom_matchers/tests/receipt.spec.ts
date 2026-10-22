// The receipt, tested with the matchers: what they are for.
import { describe, expect, test } from 'vitest';
import { buildReceipt } from '../src/receipt';

const cleanCode = { isbn: '978-0-13-235088-4', title: 'Clean Code', priceInCents: 3990 };
const etranger = { isbn: '9782070360024', title: "L'Étranger", priceInCents: 790 };

describe('buildReceipt', () => {
  test('groups the copies of a book on one line, and totals them', () => {
    const receipt = buildReceipt([cleanCode, etranger, cleanCode]);

    expect(receipt).toTotal(8770);
    expect(receipt.lines).toEqual([
      expect.objectContaining({ isbn: expect.toBeValidIsbn(), title: 'Clean Code', quantity: 2 }),
      expect.objectContaining({ isbn: expect.toBeValidIsbn(), title: "L'Étranger", quantity: 1 }),
    ]);
  });

  test('prints every ISBN without its hyphens', () => {
    const [line] = buildReceipt([cleanCode]).lines;

    expect(line?.isbn).toBe('9780132350884');
  });

  test('an empty scan totals zero', () => {
    expect(buildReceipt([])).toTotal(0);
  });

  test('refuses a mistyped ISBN', () => {
    expect(() => buildReceipt([{ ...cleanCode, isbn: '9780132350885' }])).toThrow('Invalid ISBN scanned');
  });
});
