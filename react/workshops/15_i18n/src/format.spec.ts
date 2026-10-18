import { describe, expect, it } from 'vitest';
import { formatDate, formatHeight, formatMass, formatRelative } from './format';

// `Intl` separates with no-break spaces (U+00A0, U+202F) where a typewriter
// would put a plain one: normalise them, the specs are about the format.
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('formatHeight', () => {
  it('shows metres with two decimals and the separator of the locale', () => {
    expect(plain(formatHeight(172, 'en'))).toBe('1.72 m');
    expect(plain(formatHeight(172, 'fr'))).toBe('1,72 m');
  });
});

describe('formatMass', () => {
  it('spells the unit out and groups the digits like the locale does', () => {
    expect(plain(formatMass(1358, 'en'))).toBe('1,358 kilograms');
    expect(plain(formatMass(1358, 'fr'))).toBe('1 358 kilogrammes');
  });
});

describe('formatDate', () => {
  it('writes the date in full, in the order and the words of the locale', () => {
    expect(formatDate('2014-12-20T21:17:56.891Z', 'en')).toBe('December 20, 2014');
    expect(formatDate('2014-12-20T21:17:56.891Z', 'fr')).toBe('20 décembre 2014');
  });

  it('keeps the UTC day, whatever the time zone of the machine', () => {
    expect(formatDate('2014-12-20T23:59:00Z', 'en')).toBe('December 20, 2014');
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-10-18T12:00:00Z');

  it('picks the largest unit that fits', () => {
    expect(formatRelative('2014-12-20T21:17:56.891Z', now, 'en')).toBe('12 years ago');
    expect(formatRelative('2026-10-18T09:00:00Z', now, 'en')).toBe('3 hours ago');
    expect(formatRelative('2026-10-18T11:55:00Z', now, 'en')).toBe('5 minutes ago');
  });

  it('says "yesterday" rather than "1 day ago"', () => {
    expect(formatRelative('2026-10-17T12:00:00Z', now, 'en')).toBe('yesterday');
    expect(formatRelative('2026-10-17T12:00:00Z', now, 'fr')).toBe('hier');
  });

  it('speaks the language of the locale', () => {
    expect(formatRelative('2014-12-20T21:17:56.891Z', now, 'fr')).toBe('il y a 12 ans');
    expect(formatRelative('2026-11-18T12:00:00Z', now, 'fr')).toBe('le mois prochain');
  });
});
