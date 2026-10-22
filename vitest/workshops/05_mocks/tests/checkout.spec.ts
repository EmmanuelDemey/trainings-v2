// TODO — Steps 3 to 6. The catalog: a src/__mocks__/catalog-api.ts of your own.
// The payment module: a factory that keeps chargeReference real. The mailer is
// a parameter — a vi.fn is enough.
import { describe, expect, test, vi } from 'vitest';
import { checkout, holdBooks, HOLD_DURATION_MS, type Mailer } from '../src/checkout';
import { chargeCard, refund } from '../src/payment';

describe('checkout', () => {
  test.todo('charges the total of the books, from the catalog prices');
  test.todo('mails the confirmation to the customer');
  test.todo('dates the order with the time of the payment');
  test.todo('keeps the order when the mail fails, and logs it');
  test.todo('charges nothing when a book is unknown');
  test.todo('refuses an empty basket');
});

describe('holdBooks', () => {
  test.todo('refunds and calls onExpire when the hold runs out');
  test.todo('refunds nothing once released');
});
