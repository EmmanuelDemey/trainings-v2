// TODO — Steps 3 to 5. A fresh Cart and fresh books before each test
// (beforeEach), nested describes, a test.each for the quantities refused.
import { beforeEach, describe, expect, test } from 'vitest';
import { Cart } from './cart';
import { type Book, createCatalog } from './catalog';

describe('Cart', () => {
  test.todo('starts empty');

  describe('add', () => {
    test.todo('adds one copy by default');
    test.todo('adds up the copies of the same book on one line');
    test.todo('refuses a quantity of 0, -1 and 1.5');
    test.todo('refuses more copies than the stock');
  });

  test.todo('remove drops the whole line, and ignores a book that is not there');

  describe('totals', () => {
    test.todo('the subtotal sums every line');
    test.todo('a coupon lowers the total, not the subtotal');
    test.todo('an unknown coupon is refused and changes nothing');
    test.todo('clear empties the cart and drops the coupon');
  });

  test.todo('keeps the lines in the order the books were first added');
});
