import { afterEach, describe, expect, test, vi } from 'vitest';
import { checkout, holdBooks, HOLD_DURATION_MS, type Mailer } from '../src/checkout';
import { chargeCard, refund } from '../src/payment';

// The catalog: the shared fake of src/__mocks__/catalog-api.ts.
vi.mock('../src/catalog-api');

// The payment provider: never called for real. chargeCard and refund become
// mocks; chargeReference, which touches nothing outside, stays the real one.
vi.mock('../src/payment', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/payment')>()),
  chargeCard: vi.fn(async (_token: string, amountInCents: number) => ({ id: 'ch_9876543', amountInCents })),
  refund: vi.fn(async () => {}),
}));

afterEach(() => {
  vi.useRealTimers();
});

function fakeMailer(): Mailer & { send: ReturnType<typeof vi.fn<Mailer['send']>> } {
  return { send: vi.fn<Mailer['send']>(async () => {}) };
}

describe('checkout', () => {
  test('charges the total of the books, from the catalog prices', async () => {
    const order = await checkout(['9780132350884', '9782070360024'], 'tok_visa', 'alice@example.com', fakeMailer());

    expect(vi.mocked(chargeCard)).toHaveBeenCalledExactlyOnceWith('tok_visa', 4780);
    expect(order).toMatchObject({ reference: 'CH-9876', totalInCents: 4780 });
  });

  test('mails the confirmation to the customer', async () => {
    const mailer = fakeMailer();

    await checkout(['9782070360024'], 'tok_visa', 'alice@example.com', mailer);

    expect(mailer.send).toHaveBeenCalledExactlyOnceWith(
      'alice@example.com',
      'Your order CH-9876',
      'Thank you! You paid €7.90.',
    );
  });

  test('dates the order with the time of the payment', async () => {
    vi.useFakeTimers({ now: new Date('2026-12-24T17:45:00Z') });
    const order = await checkout(['9782070360024'], 'tok_visa', 'alice@example.com', fakeMailer());

    expect(order.paidAt).toEqual(new Date('2026-12-24T17:45:00Z'));
  });

  test('keeps the order when the mail fails, and logs it', async () => {
    const mailer = fakeMailer();
    mailer.send.mockRejectedValueOnce(new Error('SMTP down'));
    using error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const order = await checkout(['9782070360024'], 'tok_visa', 'alice@example.com', mailer);

    expect(order.reference).toBe('CH-9876');
    expect(error).toHaveBeenCalledWith('Confirmation not sent for CH-9876', new Error('SMTP down'));
    expect(vi.mocked(refund)).not.toHaveBeenCalled();
  });

  test('charges nothing when a book is unknown', async () => {
    await expect(checkout(['9780000000000'], 'tok_visa', 'alice@example.com', fakeMailer())).rejects.toThrow(
      'No book with ISBN 9780000000000',
    );

    expect(vi.mocked(chargeCard)).not.toHaveBeenCalled();
  });

  test('refuses an empty basket', async () => {
    await expect(checkout([], 'tok_visa', 'alice@example.com', fakeMailer())).rejects.toThrow('The basket is empty');
  });
});

describe('holdBooks', () => {
  test('refunds and calls onExpire when the hold runs out', async () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    holdBooks('ch_1', onExpire);

    await vi.advanceTimersByTimeAsync(HOLD_DURATION_MS - 1);
    expect(onExpire).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(vi.mocked(refund)).toHaveBeenCalledWith('ch_1');
    expect(onExpire).toHaveBeenCalledOnce();
  });

  test('refunds nothing once released', async () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const hold = holdBooks('ch_1', onExpire);

    hold.release();
    await vi.runAllTimersAsync();

    expect(vi.mocked(refund)).not.toHaveBeenCalled();
    expect(onExpire).not.toHaveBeenCalled();
  });
});
