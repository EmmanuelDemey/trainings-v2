// The cart: its lines, and its total.
//
// TODO 3: rename this file to Cart.tsx, and type it in TypeScript.
import { CartLine, lineTotal } from './CartLine.jsx';

/** `1250` cents become `12.50 €`. */
export function formatPrice(cents) {
  return `${(cents / 100).toFixed(2)} €`;
}

/** The total of every line, discounts applied. */
export function Cart({ lines }) {
  const total = lines.reduce((sum, line) => sum + lineTotal(line));
  return (
    <section aria-label="Cart">
      <ul>
        {lines.map((line) => (
          <CartLine key={line.name} line={line} />
        ))}
      </ul>
      <p>Total: {formatPrice(total)}</p>
    </section>
  );
}
