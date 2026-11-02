import { describe, expect, test } from 'vitest';
import { lineTotal } from '../src/cart.js';
import { formatPrice, formatTotal } from '../src/format.js';
import { parseLine } from '../src/parse.js';

const book = { name: 'Book', price: 1250, quantity: 2, discount: 0.1 };
const pen = { name: 'Pen', price: 150, quantity: 3, discount: 0 };

describe('lineTotal', () => {
  test('multiplies the price by the quantity', () => {
    expect(lineTotal(pen)).toBe(450);
  });

  test('applies the discount', () => {
    expect(lineTotal(book)).toBe(2250);
  });
});

describe('formatPrice', () => {
  test('prints cents as euros', () => {
    expect(formatPrice(1250)).toBe('12.50 €');
  });
});

describe('formatTotal', () => {
  test('adds up every line', () => {
    expect(formatTotal([book, pen])).toBe('27.00 €');
  });

  test('says zero for an empty order', () => {
    expect(formatTotal([])).toBe('0.00 €');
  });
});

describe('parseLine', () => {
  test('reads every column', () => {
    expect(parseLine('Book;1250;2;0.1')).toEqual(book);
  });

  test('defaults the discount to zero', () => {
    expect(parseLine('Pen;150;3')).toEqual(pen);
  });
});
