// One line of the cart, and what it costs. A line looks like
// `{ name: 'Book', price: 1250, quantity: 2, discount: 0.1 }` — the price in
// cents, the discount as a rate (`0.1` means 10 %).
//
// TODO 2: describe a line with a JSDoc `@typedef`, type `lineTotal` with
// `@param` and `@returns`, and the props of `CartLine` with a `@param`. This
// file stays JavaScript.

export function lineTotal(line) {
  return Math.round(line.price * line.quantity * (1 - line.discont));
}

export function CartLine({ line }) {
  return (
    <li>
      {line.quantity} × {line.name}
    </li>
  );
}
