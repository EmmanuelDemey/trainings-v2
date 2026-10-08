import type { Payment } from './types';

export function loadPayments(): Payment[] {
  return [
    { id: 11, reference: 'PAY-7781', method: 'card', amountCents: 38_050, settled: true },
    { id: 12, reference: 'PAY-7782', method: 'transfer', amountCents: 612_500, settled: true },
    { id: 13, reference: 'PAY-7783', method: 'direct-debit', amountCents: 124_000, settled: false },
  ];
}
