import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Cart, formatPrice } from '../src/Cart.jsx';
import { lineTotal } from '../src/CartLine.jsx';
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

describe('Cart', () => {
  test('renders every line, and adds them up', () => {
    render(<Cart lines={[book, pen]} />);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['2 × Book', '3 × Pen']);
    expect(screen.getByText('Total: 27.00 €')).toBeDefined();
  });

  test('says zero for an empty cart', () => {
    render(<Cart lines={[]} />);
    expect(screen.getByText('Total: 0.00 €')).toBeDefined();
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
