// TODO — Steps 1 and 2. payment.ts talks to the provider with fetch: replace
// fetch, nothing else. No test may reach the network.
import { describe, expect, test, vi } from 'vitest';
import { chargeCard, chargeReference, refund } from '../src/payment';

describe('chargeCard', () => {
  test.todo('posts the card and the amount to the provider');
  test.todo('throws when the provider refuses');
});

describe('refund', () => {
  test.todo('posts to the refund route of the charge');
  test.todo('throws when the provider fails');
});

describe('PAYMENT_API_URL', () => {
  test.todo('comes from the environment when it is set');
});

test.todo('chargeReference shortens the charge id');
