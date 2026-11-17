import { describe, expectTypeOf, test } from 'vitest';
import type { SalesReportProps } from '../src/SalesReport.tsx';
import type { Sale } from '../src/sales.ts';

// Checked against tsconfig.base.json — the options every project of the app
// compiles with.

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
  test('an optional prop may be left out', () => {
    expectTypeOf<{ sales: Sale[] }>().toExtend<SalesReportProps>();
  });

  test('an optional prop may not be set to undefined', () => {
    expectTypeOf<{ sales: Sale[]; currency: undefined }>().not.toExtend<SalesReportProps>();
  });
});
