import { fetchBook } from './catalog-api';
import { chargeCard, chargeReference, refund } from './payment';

export interface Mailer {
  send(to: string, subject: string, body: string): Promise<void>;
}

export interface Order {
  reference: string;
  email: string;
  totalInCents: number;
  paidAt: Date;
}

/** How long the books stay set aside for a customer who started paying. */
export const HOLD_DURATION_MS = 15 * 60 * 1000;

/**
 * Checks out a basket of ISBNs: prices them from the catalog, charges the card,
 * mails the confirmation. If the mail cannot be sent, the order still stands —
 * it is logged, not refunded. If anything before fails, nothing is charged.
 */
export async function checkout(isbns: string[], cardToken: string, email: string, mailer: Mailer): Promise<Order> {
  if (isbns.length === 0) {
    throw new Error('The basket is empty');
  }
  const books = await Promise.all(isbns.map((isbn) => fetchBook(isbn)));
  const totalInCents = books.reduce((sum, book) => sum + book.priceInCents, 0);

  const charge = await chargeCard(cardToken, totalInCents);
  const order = { reference: chargeReference(charge), email, totalInCents, paidAt: new Date() };

  try {
    await mailer.send(email, `Your order ${order.reference}`, `Thank you! You paid €${(totalInCents / 100).toFixed(2)}.`);
  } catch (error) {
    console.error(`Confirmation not sent for ${order.reference}`, error);
  }
  return order;
}

/**
 * Sets the books aside while the customer pays. When the hold runs out, the
 * charge is refunded and `onExpire` is called — unless `release` came first.
 */
export function holdBooks(chargeId: string, onExpire: () => void): { release(): void } {
  const timer = setTimeout(async () => {
    await refund(chargeId);
    onExpire();
  }, HOLD_DURATION_MS);
  return { release: () => clearTimeout(timer) };
}
