/**
 * The coupons the shop accepts:
 * - `SAVE10`  — 10 % off, rounded down to the cent
 * - `HALF`    — 50 % off, only from €40.00 on
 * - `FIVEOFF` — €5.00 off, never below zero
 * The code is read case-insensitively. An unknown code throws.
 */
export function applyCoupon(totalInCents: number, code: string): number {
  switch (code.toUpperCase()) {
    case 'SAVE10':
      return Math.floor(totalInCents * 0.9);
    case 'HALF':
      if (totalInCents < 4000) {
        throw new Error('HALF needs a cart of €40.00 or more');
      }
      return Math.floor(totalInCents / 2);
    case 'FIVEOFF':
      return Math.max(0, totalInCents - 500);
    default:
      throw new Error(`Unknown coupon: ${code}`);
  }
}
