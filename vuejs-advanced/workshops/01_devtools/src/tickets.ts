import type { Ticket } from './api/fakeApi';

/** Free-text match over the subject and the requester, accent- and case-blind. */
export function matches(ticket: Ticket, filter: string): boolean {
  const needle = normalize(filter);
  if (needle === '') return true;
  return normalize(ticket.subject).includes(needle) || normalize(ticket.requester).includes(needle);
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
