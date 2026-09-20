import { beforeEach, describe, expect, it } from 'vitest';
import { i18n } from '@/i18n';
import { setLocale } from '@/i18n/setLocale';
import { apiHeaders } from '@/api/client';
import { resetLocale } from './helpers';

beforeEach(async () => {
  await resetLocale();
});

describe('switching locale', () => {
  it('loads a catalogue that was not shipped with the bundle', async () => {
    expect(i18n.global.availableLocales).not.toContain('de');

    await setLocale('de');

    expect(i18n.global.locale.value).toBe('de');
    expect(i18n.global.t('app.title')).toBe('Laden');
  });

  it('does not download the same catalogue twice', async () => {
    await setLocale('de');
    const afterFirst = [...i18n.global.availableLocales].sort();

    await setLocale('fr');
    await setLocale('de');

    expect([...i18n.global.availableLocales].sort()).toEqual(afterFirst);
  });

  it('refuses a locale it does not ship', async () => {
    await expect(setLocale('es' as 'de')).rejects.toThrow(/es/);
  });

  it('lets the newest switch win when two overlap', async () => {
    // `await import()` has no cancellation: without a guard, whichever import
    // resolves last sets the locale — and that is rarely the one the user asked
    // for second.
    await setLocale('en');

    const slow = setLocale('de');
    const fast = setLocale('en');
    await Promise.all([slow, fast]);

    expect(i18n.global.locale.value).toBe('en');
  });
});

describe('what a locale switch has to touch besides the messages', () => {
  it('updates <html lang>, which a11y, hyphenation and :lang() all read', async () => {
    await setLocale('de');

    expect(document.documentElement.lang).toBe('de');
  });

  it('updates Accept-Language, or the backend keeps answering in the old one', async () => {
    await setLocale('de');

    expect(apiHeaders['Accept-Language']).toBe('de');
  });
});
