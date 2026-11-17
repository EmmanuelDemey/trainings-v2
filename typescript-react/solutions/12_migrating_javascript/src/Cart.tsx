// The cart: its lines, and its total. Renamed from Cart.jsx: a TypeScript file, at last.
import { CartLine, lineTotal, type Line } from './CartLine.jsx';

/** `1250` cents become `12.50 €`. */
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

export interface CartProps {
  lines: Line[];
}

/** The total of every line, discounts applied. */
export function Cart({ lines }: CartProps) {
  const total = lines.reduce((sum, line) => sum + lineTotal(line), 0);
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
