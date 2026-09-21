/**
 * What is left of the shared types file once payments moved out. A shared types
 * file is how two features start changing together for no reason.
 *
 * TODO 1: move this to `features/invoicing/types.ts` — `features/payments/`
 *   shows the way.
 */

export interface Invoice {
  id: number;
  reference: string;
  client: string;
  amountCents: number;
  status: 'draft' | 'sent' | 'paid' | 'late';
}
