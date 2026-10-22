import { describe, expect, test, vi } from 'vitest';
import { createOrder } from '../src/order';
import { formatReceipt } from '../src/receipt';
import { cleanCode, etranger } from './fixtures';

describe('formatReceipt', () => {
  test('prints one row per line, then the totals', () => {
    const order = createOrder('alice@example.com', [cleanCode, etranger]);

    expect(formatReceipt(order)).toMatchInlineSnapshot(`
      "      THE PAPER LANTERN — BOOKSHOP
      ========================================
      2 × Clean Code .................. €79.80
      1 × L'Étranger ................... €7.90
      ----------------------------------------
      Subtotal ........................ €87.70
      TOTAL ........................... €87.70
      ========================================"
    `);
  });

  test('prints the coupon between the subtotal and the total', async () => {
    const order = createOrder('alice@example.com', [cleanCode, etranger], { coupon: 'SAVE10', inCents: 877 });

    // A whole ticket reads best in a file of its own, opened as is in the editor.
    await expect(formatReceipt(order)).toMatchFileSnapshot('./__snapshots__/receipt-with-coupon.txt');
  });

  test('prints an empty ticket for an empty order', () => {
    const order = createOrder('alice@example.com', []);

    expect(formatReceipt(order)).toMatchInlineSnapshot(`
      "      THE PAPER LANTERN — BOOKSHOP
      ========================================
      ----------------------------------------
      Subtotal ......................... €0.00
      TOTAL ............................ €0.00
      ========================================"
    `);
  });
});
