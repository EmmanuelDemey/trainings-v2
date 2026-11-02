// What the order prints. Renamed from format.js: a TypeScript file, at last.
import { lineTotal, type Line } from './cart.js';

/** `1250` cents become `12.50 €`. */
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

/** The total of every line, discounts applied. */
export function formatTotal(lines: Line[]): string {
  const total = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  return formatPrice(total);
}
