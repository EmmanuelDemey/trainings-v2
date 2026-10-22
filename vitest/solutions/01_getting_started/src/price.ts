/**
 * Prices are stored in cents — integers, so that 0.1 + 0.2 never shows up on
 * a receipt — and only turned into text at the very end.
 */

/** 1250 → "€12.50". */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** "12.50" → 1250, "8" → 800. Throws on anything that is not a price. */
export function priceInCents(euros: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(euros.trim());
  if (!match) {
    throw new Error(`Not a price: "${euros}"`);
  }
  const [, units, decimals = ''] = match;
  return Number(units) * 100 + Number(decimals.padEnd(2, '0'));
}
