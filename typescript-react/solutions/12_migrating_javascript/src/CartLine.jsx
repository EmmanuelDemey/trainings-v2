// One line of the cart, and what it costs. This file stays JavaScript: its
// types live in JSDoc comments, and `checkJs` reads them.

/**
 * One line of the cart.
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

/**
 * @param {{ line: Line }} props
 */
export function CartLine({ line }) {
  return (
    <li>
      {line.quantity} × {line.name}
    </li>
  );
}
