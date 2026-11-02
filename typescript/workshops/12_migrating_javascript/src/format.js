// What the order prints.
//
// TODO 3: rename this file to format.ts, and type it in TypeScript.
import { lineTotal } from './cart.js';

/** `1250` cents become `12.50 €`. */
export function formatPrice(cents) {
  return `${(cents / 100).toFixed(2)} €`;
}

/** The total of every line, discounts applied. */
export function formatTotal(lines) {
  const total = lines.reduce((sum, line) => sum + lineTotal(line));
  return formatPrice(total);
}
