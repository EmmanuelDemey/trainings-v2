import { describe, expect, it } from 'vitest';
import { describePayment, PaymentSchema } from '../src/schemas/payment';

describe('PaymentSchema', () => {
  it.each([
    { method: 'card', last4: '4242', expiry: '09/28' },
    { method: 'paypal', email: 'nina@example.com' },
    { method: 'voucher', code: 'GIFT2026' },
  ])('accepts a valid $method payment', (payment) => {
    expect(PaymentSchema.parse(payment)).toEqual(payment);
  });

  it('rejects a card payment with the fields of another method', () => {
    expect(PaymentSchema.safeParse({ method: 'card', email: 'nina@example.com' }).success).toBe(false);
  });

  it('reports an unknown method on the `method` field itself', () => {
    const result = PaymentSchema.safeParse({ method: 'cash' });
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([['method']]);
  });

  it('reports only the broken fields of the method that was chosen', () => {
    const result = PaymentSchema.safeParse({ method: 'card', last4: '42', expiry: '13/28' });
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([['last4'], ['expiry']]);
  });

  it('rejects a voucher code that is not 8 characters long', () => {
    expect(PaymentSchema.safeParse({ method: 'voucher', code: 'GIFT' }).success).toBe(false);
  });
});

describe('describePayment', () => {
  it('prints each method its own way', () => {
    const receipt = (payment: unknown) => describePayment(PaymentSchema.parse(payment));

    expect(receipt({ method: 'card', last4: '4242', expiry: '09/28' })).toBe('Card ending in 4242');
    expect(receipt({ method: 'paypal', email: 'nina@example.com' })).toBe('PayPal (nina@example.com)');
    expect(receipt({ method: 'voucher', code: 'GIFT2026' })).toBe('Voucher GIFT2026');
  });
});
