import { describe, expect, it } from 'vitest';
import { formatHeight, formatMass } from './format';

describe('formatHeight', () => {
  it('turns centimetres into metres with two decimals', () => {
    expect(formatHeight(172)).toBe('1.72 m');
  });

  it('keeps the leading zero under one metre', () => {
    expect(formatHeight(96)).toBe('0.96 m');
  });
});

describe('formatMass', () => {
  it('appends the unit to a known mass', () => {
    expect(formatMass(77)).toBe('77 kg');
  });

  it('says "unknown" when the mass is null', () => {
    expect(formatMass(null)).toBe('unknown');
  });
});
