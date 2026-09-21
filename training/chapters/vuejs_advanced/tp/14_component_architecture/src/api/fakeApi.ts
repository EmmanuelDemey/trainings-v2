import type { Invoice } from '../types';

export function loadInvoices(): Invoice[] {
  return [
    { id: 1, reference: 'INV-2041', client: 'Northwind', amountCents: 124_000, status: 'late' },
    { id: 2, reference: 'INV-2042', client: 'Aperture', amountCents: 38_050, status: 'sent' },
    { id: 3, reference: 'INV-2043', client: 'Monolith', amountCents: 612_500, status: 'paid' },
    { id: 4, reference: 'INV-2044', client: 'Enigma', amountCents: 9_900, status: 'draft' },
  ];
}
