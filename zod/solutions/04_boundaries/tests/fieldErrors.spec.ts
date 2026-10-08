import { describe, expect, it } from 'vitest';
import { FORM, pathToKey, toFieldErrors } from '../src/fieldErrors';
import { OrderSchema } from '../src/order';

const order = {
  customer: { name: 'Nina', email: 'nina@example.com' },
  lines: [{ concertId: 'c1', quantity: 2 }],
};

/** The field errors of an order — `{}` when it is valid. */
function errorsOf(input: unknown) {
  const result = OrderSchema.safeParse(input);
  return result.success ? {} : toFieldErrors(result.error);
}

describe('pathToKey', () => {
  it.each([
    [['email'], 'email'],
    [['customer', 'email'], 'customer.email'],
    [['lines', 0, 'quantity'], 'lines[0].quantity'],
    [['lines', 1], 'lines[1]'],
    [[], FORM],
  ])('turns %j into %s', (path, key) => {
    expect(pathToKey(path)).toBe(key);
  });
});

describe('toFieldErrors', () => {
  it('keys a nested error by its full path', () => {
    expect(errorsOf({ ...order, customer: { name: 'Nina', email: 'nope' } })).toEqual({
      'customer.email': 'Enter a valid email address',
    });
  });

  it('keys an error in an array by its index', () => {
    const lines = [{ concertId: 'c1', quantity: 2 }, { concertId: 'c2', quantity: 0 }];
    expect(errorsOf({ ...order, lines })).toEqual({ 'lines[1].quantity': 'At least one ticket' });
  });

  it('puts an error about the whole order under the form key', () => {
    const lines = ['c1', 'c2', 'c3', 'c4'].map((concertId) => ({ concertId, quantity: 1 }));
    expect(errorsOf({ ...order, lines })).toEqual({ [FORM]: 'Three concerts per order at most' });
  });

  it('keeps only the first message of each field', () => {
    const result = OrderSchema.safeParse({ ...order, customer: { name: '', email: '' } });
    expect(result.success).toBe(false);
    expect(Object.keys(toFieldErrors(result.error!))).toEqual(['customer.name', 'customer.email']);
  });

  it('reports every broken field at once', () => {
    expect(errorsOf({ customer: { name: '', email: 'nina@example.com' }, lines: [] })).toEqual({
      'customer.name': 'Your name is required',
      lines: 'Your basket is empty',
    });
  });
});
