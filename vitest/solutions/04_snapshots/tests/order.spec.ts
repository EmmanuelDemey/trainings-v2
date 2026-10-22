import { expect, test } from 'vitest';
import { createOrder } from '../src/order';
import { cleanCode, etranger } from './fixtures';

// The id and the date change on every run: property matchers check their
// shape, the snapshot keeps everything else.
test('records the order, with its amounts', () => {
  const order = createOrder('alice@example.com', [cleanCode, etranger], { coupon: 'SAVE10', inCents: 877 });

  expect(order).toMatchSnapshot({
    id: expect.stringMatching(/^[0-9a-f-]{36}$/),
    createdAt: expect.any(Date),
  });
});

test('an order without coupon has no discount', () => {
  const order = createOrder('bob@example.com', [etranger]);

  expect(order).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date),
  });
});
