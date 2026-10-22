import { beforeEach, describe, expect, test } from 'vitest';
import { Cart } from './cart';
import { type Book, createCatalog } from './catalog';

describe('Cart', () => {
  let cart: Cart;
  let cleanCode: Book;
  let effectiveJava: Book;
  let etranger: Book;

  beforeEach(() => {
    cart = new Cart();
    [cleanCode, effectiveJava, etranger] = createCatalog();
  });

  test('starts empty', () => {
    expect(cart.count()).toBe(0);
    expect(cart.lines()).toEqual([]);
    expect(cart.totalInCents()).toBe(0);
  });

  describe('add', () => {
    test('adds one copy by default', () => {
      cart.add(cleanCode);

      expect(cart.count()).toBe(1);
      expect(cart.lines()).toEqual([{ book: cleanCode, quantity: 1 }]);
    });

    test('adds up the copies of the same book on one line', () => {
      cart.add(cleanCode);
      cart.add(cleanCode, 2);

      expect(cart.lines()).toHaveLength(1);
      expect(cart.count()).toBe(3);
    });

    test.each([0, -1, 1.5])('refuses a quantity of %s', (quantity) => {
      expect(() => cart.add(cleanCode, quantity)).toThrow(RangeError);
    });

    test('refuses more copies than the stock', () => {
      cart.add(effectiveJava);

      expect(() => cart.add(effectiveJava)).toThrow('Only 1 left of "Effective Java"');
      expect(cart.count()).toBe(1);
    });
  });

  test('remove drops the whole line, and ignores a book that is not there', () => {
    cart.add(cleanCode, 2);
    cart.add(etranger);

    cart.remove(cleanCode.isbn);
    cart.remove('9999999999999');

    expect(cart.lines()).toEqual([{ book: etranger, quantity: 1 }]);
  });

  describe('totals', () => {
    beforeEach(() => {
      cart.add(cleanCode, 2); // 2 × 39.90
      cart.add(etranger); //     1 ×  7.90
    });

    test('the subtotal sums every line', () => {
      expect(cart.subtotalInCents()).toBe(8770);
      expect(cart.totalInCents()).toBe(8770);
    });

    test('a coupon lowers the total, not the subtotal', () => {
      cart.applyCoupon('HALF');

      expect(cart.subtotalInCents()).toBe(8770);
      expect(cart.totalInCents()).toBe(4385);
    });

    test('an unknown coupon is refused and changes nothing', () => {
      expect(() => cart.applyCoupon('NOPE')).toThrow();
      expect(cart.totalInCents()).toBe(8770);
    });

    test('clear empties the cart and drops the coupon', () => {
      cart.applyCoupon('SAVE10');

      cart.clear();
      cart.add(etranger);

      expect(cart.totalInCents()).toBe(790);
    });
  });

  test.todo('keeps the lines in the order the books were first added');
});
