export interface Payment {
  id: number;
  reference: string;
  method: 'card' | 'transfer' | 'direct-debit';
  amountCents: number;
  settled: boolean;
}
