// TODO — Step 3.
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { BOOKS, type Book } from '../src/books';
import CartSummary from '../src/components/CartSummary.vue';

const [cleanCode, , etranger] = BOOKS as [Book, Book, Book];

describe('CartSummary', () => {
  test.todo('says the cart is empty, and checkout is disabled');
  test.todo('lists the lines and their total');
  test.todo('emits remove with the ISBN of the line');
  test.todo('emits checkout with the coupon typed, trimmed');
  test.todo('emits checkout with null when no coupon is typed');
});
