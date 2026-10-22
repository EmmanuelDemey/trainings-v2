// TODO — Steps 1 and 2. toMatchInlineSnapshot() with no argument: Vitest writes
// the ticket into this file on the first run. The coupon ticket goes to a file
// of its own, __snapshots__/receipt-with-coupon.txt.
import { describe, expect, test } from 'vitest';
import { createOrder } from '../src/order';
import { formatReceipt } from '../src/receipt';
import { cleanCode, etranger } from './fixtures';

describe('formatReceipt', () => {
  test.todo('prints one row per line, then the totals');
  test.todo('prints the coupon between the subtotal and the total');
  test.todo('prints an empty ticket for an empty order');
});
