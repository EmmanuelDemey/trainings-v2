/**
 * Two domains in one file. Invoicing and payments are different teams with
 * different roadmaps — and their types share nothing but a shape.
 *
 * TODO 1: split this into `features/invoicing/types.ts` and
 *   `features/payments/types.ts`. A shared types file is how two features start
 *   changing together for no reason.
 */

export interface Invoice {
  id: number;
  reference: string;
  client: string;
  amountCents: number;
  status: 'draft' | 'sent' | 'paid' | 'late';
}

export interface Payment {
  id: number;
  reference: string;
  method: 'card' | 'transfer' | 'direct-debit';
  amountCents: number;
  settled: boolean;
}
