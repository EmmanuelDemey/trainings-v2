// A price, formatted for its currency.
import type { ReactElement } from 'react';
import type { Currency } from './cart.ts';

export interface PriceProps {
  /** In cents. */
  cents: number;
  currency?: Currency;
}

/** `<span>12.50 €</span>`, `<span>$12.50</span>` or `<span>£12.50</span>`. */
export function Price({ cents, currency = 'EUR' }: PriceProps): ReactElement {
  const amount = (cents / 100).toFixed(2);
  switch (currency) {
    case 'EUR':
      return <span>{`${amount} €`}</span>;
    case 'USD':
      return <span>{`$${amount}`}</span>;
    case 'GBP':
      return <span>{`£${amount}`}</span>;
  }
}
