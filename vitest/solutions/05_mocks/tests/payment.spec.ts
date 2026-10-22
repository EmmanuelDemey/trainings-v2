// payment.ts talks to the provider with fetch: here, fetch is the one thing replaced.
import { describe, expect, test, vi } from 'vitest';
import { chargeCard, chargeReference, refund } from '../src/payment';

describe('chargeCard', () => {
  test('posts the card and the amount to the provider', async () => {
    const fetch = vi.fn(async () => Response.json({ id: 'ch_42', amountInCents: 3990 }));
    vi.stubGlobal('fetch', fetch);

    const charge = await chargeCard('tok_visa', 3990);

    expect(charge).toEqual({ id: 'ch_42', amountInCents: 3990 });
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      'https://payments.paper-lantern.example/charges',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ cardToken: 'tok_visa', amountInCents: 3990 }) }),
    );
  });

  test('throws when the provider refuses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 402 })));

    await expect(chargeCard('tok_declined', 3990)).rejects.toThrow('Payment refused (402)');
  });
});

describe('refund', () => {
  test('posts to the refund route of the charge', async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);

    await refund('ch_42');

    expect(fetch).toHaveBeenCalledExactlyOnceWith('https://payments.paper-lantern.example/charges/ch_42/refund', {
      method: 'POST',
    });
  });

  test('throws when the provider fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })));

    await expect(refund('ch_42')).rejects.toThrow('Refund failed (500)');
  });
});

describe('PAYMENT_API_URL', () => {
  // config.ts reads the variable when it LOADS — and the import at the top of
  // this file already loaded it. Stubbing is not enough: the module cache is
  // emptied, and the modules loaded again, after the stub.
  test('comes from the environment when it is set', async () => {
    vi.stubEnv('PAYMENT_API_URL', 'http://localhost:4010');
    vi.resetModules();
    const fetch = vi.fn(async () => Response.json({ id: 'ch_1', amountInCents: 1 }));
    vi.stubGlobal('fetch', fetch);

    const { chargeCard } = await import('../src/payment');
    await chargeCard('tok_visa', 1);

    expect(fetch).toHaveBeenCalledWith('http://localhost:4010/charges', expect.anything());
  });
});

test('chargeReference shortens the charge id', () => {
  expect(chargeReference({ id: 'ch_1234567890', amountInCents: 0 })).toBe('CH-1234');
});
