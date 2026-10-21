import { describe, expectTypeOf, test } from 'vitest';
import type { ReportOptions, Sale } from '../packages/core/src/index.ts';

// Checked against tsconfig.base.json — the options every package of the
// workspace compiles with.

describe('noUncheckedIndexedAccess', () => {
  test('an array element may be missing', () => {
    const sales: Sale[] = [];
    expectTypeOf(sales[0]).toEqualTypeOf<Sale | undefined>();
  });

  test('a record entry may be missing', () => {
    const totals: Record<string, number> = {};
    expectTypeOf(totals.north).toEqualTypeOf<number | undefined>();
  });
});

describe('exactOptionalPropertyTypes', () => {
  test('an optional option may be left out', () => {
    expectTypeOf<{}>().toExtend<ReportOptions>();
  });

  test('an optional option may not be set to undefined', () => {
    expectTypeOf<{ currency: undefined }>().not.toExtend<ReportOptions>();
  });
});
