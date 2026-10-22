import { PAYMENT_API_URL } from './config';

export interface Charge {
  id: string;
  amountInCents: number;
}

/** Charges the card through the payment provider. Real money: never from a test. */
export async function chargeCard(cardToken: string, amountInCents: number): Promise<Charge> {
  const response = await fetch(`${PAYMENT_API_URL}/charges`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cardToken, amountInCents }),
  });
  if (!response.ok) {
    throw new Error(`Payment refused (${response.status})`);
  }
  return (await response.json()) as Charge;
}

/** Gives the money back. */
export async function refund(chargeId: string): Promise<void> {
  const response = await fetch(`${PAYMENT_API_URL}/charges/${chargeId}/refund`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Refund failed (${response.status})`);
  }
}

/** A charge reference as printed on the receipt: "ch_1234…" → "CH-1234". */
export function chargeReference(charge: Charge): string {
  return charge.id.replace(/^ch_/, 'CH-').slice(0, 7).toUpperCase();
}
