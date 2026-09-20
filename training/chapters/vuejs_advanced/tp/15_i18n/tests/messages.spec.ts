import { beforeEach, describe, expect, it } from 'vitest';
import { i18n } from '@/i18n';
import { setLocale } from '@/i18n/setLocale';
import { resetLocale } from './helpers';

const { t, n } = i18n.global;

beforeEach(async () => {
  await resetLocale();
});

describe('the four message forms', () => {
  it('fills a named placeholder', () => {
    expect(t('app.greeting', { name: 'Manu' })).toBe('Bonjour Manu');
  });

  it('fills a list placeholder', () => {
    expect(t('app.openingRange', ['lundi', 'vendredi'])).toBe('Ouvert du lundi au vendredi');
  });

  it('resolves a linked message followed by punctuation', () => {
    // `@:legal.tos.` runs until a SPACE, so the dot is part of the key and the
    // raw key ends up on screen. Wrapping it is the fix: `@:{'legal.tos'}`.
    expect(t('legal.accept')).toBe("J'accepte les conditions générales.");
  });

  it('applies a linked modifier', () => {
    expect(t('legal.shout')).toBe('CONDITIONS GÉNÉRALES');
  });

  it('prints a literal brace when it is escaped', () => {
    expect(t('legal.currencyNote')).toBe('Les prix sont exprimés en {devise}');
  });
});

describe('pluralization', () => {
  it('uses the English rule for English — and it is right', async () => {
    await setLocale('en');

    expect(t('cart.items', 0)).toBe('no item');
    expect(t('cart.items', 1)).toBe('one item');
    expect(t('cart.items', 7)).toBe('7 items');
  });

  it('gives French its own rule, because zero takes the singular', () => {
    // vue-i18n's default rule is English grammar, hard-coded:
    //   choicesLength === 2 ? (choice === 1 ? 0 : 1) : Math.min(choice, 2)
    // In French, "0 article" is singular. Nothing warns you.
    expect(t('cart.items', 0)).toBe('article');
    expect(t('cart.items', 1)).toBe('article');
    expect(t('cart.items', 2)).toBe('articles');
  });
});

describe('numbers, named once', () => {
  it('formats a currency for the active locale', () => {
    expect(n(1234.5, 'currency')).toContain('€');
    expect(n(1234.5, 'currency')).toMatch(/1.234,50/);
  });

  it('formats the same number differently in English', async () => {
    await setLocale('en');

    expect(n(1234.5, 'currency')).toBe('$1,234.50');
  });

  it('formats a percentage', () => {
    expect(n(0.15, 'percent')).toMatch(/15\s*%/);
  });

  it('formats a compact number', async () => {
    await setLocale('en');

    expect(n(12800, 'compact')).toBe('13K');
  });
});

describe('the fallback', () => {
  it('falls back instead of rendering the key itself', () => {
    expect(i18n.global.fallbackLocale.value).toBe('en');
  });
});
