import { describe, expect, it } from 'vitest';
import { BookingSchema } from '../src/schemas/booking';

const booking = {
  email: 'nina@example.com',
  confirmEmail: 'nina@example.com',
  tier: 'standard',
  quantity: '2',
};

/** `[path, message]` for every issue the booking raises. */
function issues(input: Record<string, unknown>) {
  const result = BookingSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => [issue.path.join('.'), issue.message]);
}

describe('BookingSchema', () => {
  it('accepts a valid booking, and coerces the quantity', () => {
    expect(BookingSchema.parse(booking)).toMatchObject({ quantity: 2 });
  });

  it('normalises the emails before comparing them', () => {
    expect(issues({ ...booking, confirmEmail: '  Nina@Example.COM ' })).toEqual([]);
  });

  it('blames the confirmation field when the emails differ', () => {
    expect(issues({ ...booking, confirmEmail: 'nina@example.org' })).toEqual([
      ['confirmEmail', 'The two email addresses do not match'],
    ]);
  });

  it('limits backstage passes to 2 per order', () => {
    expect(issues({ ...booking, tier: 'backstage', quantity: 3 })).toEqual([
      ['quantity', 'Backstage passes are limited to 2 per order'],
    ]);
  });

  it('refuses a promo code on backstage passes', () => {
    expect(issues({ ...booking, tier: 'backstage', promoCode: 'SUMMER' })).toEqual([
      ['promoCode', 'Promo codes do not apply to backstage passes'],
    ]);
  });

  it('reports both backstage rules at once', () => {
    expect(issues({ ...booking, tier: 'backstage', quantity: 4, promoCode: 'SUMMER' }).map(([path]) => path)).toEqual([
      'quantity',
      'promoCode',
    ]);
  });

  it('accepts a promo code and 10 seats outside backstage', () => {
    expect(issues({ ...booking, tier: 'vip', quantity: 10, promoCode: 'SUMMER' })).toEqual([]);
  });
});
