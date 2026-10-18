import { describe, expect, it, vi } from 'vitest';
import { formatHeight, formatMass } from './format';

describe('formatHeight', () => {
  it('converts centimetres to metres with two decimals', () => {
    expect(formatHeight('172')).toBe('1.72 m');
  });

  it('keeps two decimals for a round value', () => {
    expect(formatHeight('200')).toBe('2.00 m');
  });

  it.each([undefined, 'unknown'])('shows "unknown" for %s', (height) => {
    expect(formatHeight(height)).toBe('unknown');
  });

  it('warns about an unparsable height and shows "unknown"', () => {
    // `using`: the spy is restored at the end of this block, whatever happens.
    // `mockImplementation` also keeps the warning out of the test output.
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(formatHeight('tall')).toBe('unknown');
    expect(warn).toHaveBeenCalledExactlyOnceWith('Unparsable height: "tall"');
  });

  it('formats a whole column the same way', () => {
    // A snapshot pins a table of outputs down in one assertion. Inline, the
    // expected value stays readable in the spec — and reviewed in the diff.
    expect(['172', '96', '202', undefined].map(formatHeight)).toMatchInlineSnapshot(`
      [
        "1.72 m",
        "0.96 m",
        "2.02 m",
        "unknown",
      ]
    `);
  });
});

describe('formatMass', () => {
  it('appends the unit', () => {
    expect(formatMass('77')).toBe('77 kg');
  });

  it('drops the thousands separator the API sends', () => {
    expect(formatMass('1,358')).toBe('1358 kg');
  });

  it.each([undefined, 'unknown'])('shows "unknown" for %s', (mass) => {
    expect(formatMass(mass)).toBe('unknown');
  });
});
