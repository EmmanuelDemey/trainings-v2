// The lines of an order, and what each one costs. This file stays JavaScript:
// its types live in JSDoc comments, and `checkJs` reads them.

/**
 * One line of an order.
 * @typedef {object} Line
 * @property {string} name
 * @property {number} price      In cents.
 * @property {number} quantity
 * @property {number} discount   `0.1` means 10 %.
 */

/**
 * The price of a line, discount applied, in cents.
 * @param {Line} line
 * @returns {number}
 */
export function lineTotal(line) {
  return Math.round(line.price * line.quantity * (1 - line.discount));
}
