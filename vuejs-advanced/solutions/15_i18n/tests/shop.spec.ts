import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '@/i18n/setLocale';
import { mountShop, normalizeSpaces, resetLocale } from './helpers';

beforeEach(async () => {
  await resetLocale();
});

describe('the shop, in French', () => {
  it('prices in euros, with the French separators', () => {
    using shop = mountShop();

    const price = normalizeSpaces(shop.wrapper.get('[data-testid="product-price"]').text());
    expect(price).toBe('1 234,50 €');
  });

  it('shows a discount as a percentage and a view count in compact form', () => {
    using shop = mountShop();

    expect(normalizeSpaces(shop.wrapper.get('[data-testid="product-discount"]').text())).toBe('15 %');
    expect(normalizeSpaces(shop.wrapper.get('[data-testid="product-views"]').text())).toBe('13 k');
  });

  it('says "0 article", singular', () => {
    using shop = mountShop();

    expect(shop.wrapper.get('[data-testid="cart-items"]').text()).toBe('0 article');
  });

  it('pluralizes as the cart fills', async () => {
    using shop = mountShop();

    await shop.wrapper.get('[data-testid="add-item"]').trigger('click');
    expect(shop.wrapper.get('[data-testid="cart-items"]').text()).toBe('1 article');

    await shop.wrapper.get('[data-testid="add-item"]').trigger('click');
    expect(shop.wrapper.get('[data-testid="cart-items"]').text()).toBe('2 articles');
  });
});

describe('switching locale from the UI', () => {
  it('re-renders everything that used a message', async () => {
    using shop = mountShop();

    await shop.wrapper.get('[data-testid="locale-en"]').trigger('click');

    // The click handler cannot be awaited — `pick()` fires `setLocale()` and
    // returns. Behind it is a real `import()`, which takes an unknown number of
    // ticks: waiting a fixed one passes on a warm machine and fails on a cold
    // CI runner. Wait for the outcome instead.
    await vi.waitFor(() =>
      expect(shop.wrapper.get('[data-testid="product-price"]').text()).toBe('$1,234.50'),
    );
    expect(shop.wrapper.get('[data-testid="cart-items"]').text()).toBe('0 no item');
    expect(shop.wrapper.get('[data-testid="accept"]').text()).toBe(
      'I accept the terms and conditions.',
    );
  });

  it('marks the active locale', async () => {
    using shop = mountShop();

    await shop.wrapper.get('[data-testid="locale-de"]').trigger('click');

    await vi.waitFor(() =>
      expect(shop.wrapper.get('[data-testid="locale-de"]').attributes('aria-pressed')).toBe('true'),
    );
    expect(shop.wrapper.get('[data-testid="locale-fr"]').attributes('aria-pressed')).toBe('false');
  });
});
