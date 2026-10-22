// TODO — Step 2. Every rule of src/coupon.ts: SAVE10, HALF and FIVEOFF, their
// rounding, their floor — one test.each for the amounts, one test per error.
import { describe, expect, test } from 'vitest';
import { applyCoupon } from './coupon';

describe('applyCoupon', () => {
  test.todo('$code on $total cents gives $expected');
  test.todo('reads the code case-insensitively');
  test.todo('refuses HALF under €40.00');
  test.todo('refuses an unknown code');
});
