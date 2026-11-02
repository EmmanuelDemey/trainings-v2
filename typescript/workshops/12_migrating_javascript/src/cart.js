// The lines of an order, and what each one costs. A line looks like
// `{ name: 'Book', price: 1250, quantity: 2, discount: 0.1 }` — the price in
// cents, the discount as a rate (`0.1` means 10 %).
//
// TODO 2: describe a line with a JSDoc `@typedef`, and type `lineTotal` with
// `@param` and `@returns`. This file stays JavaScript.

export function lineTotal(line) {
  return Math.round(line.price * line.quantity * (1 - line.discont));
}
