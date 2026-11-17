// A price, formatted for its currency.
import type { ReactElement } from 'react';
import type { Currency } from './cart.ts';

export interface PriceProps {
  /** In cents. */
  cents: number;
  currency?: Currency;
}

/** TODO 4: `<span>12.50 €</span>`, `<span>$12.50</span>` or `<span>£12.50</span>` — in euros when no currency is given. */
export function Price({ cents, currency }: PriceProps): ReactElement {
  return <span />;
}
