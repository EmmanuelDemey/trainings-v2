export interface Invoice {
  id: number;
  reference: string;
  client: string;
  amountCents: number;
  status: 'draft' | 'sent' | 'paid' | 'late';
}
