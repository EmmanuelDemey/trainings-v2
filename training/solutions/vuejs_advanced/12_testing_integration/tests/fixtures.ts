import type { Session, Ticket } from '@/api/client';

export const tickets: Ticket[] = [
  { id: 1, subject: 'Card declined on renewal', requester: 'ada@northwind.io', priority: 'urgent', status: 'open' },
  { id: 2, subject: 'CSV export truncates names', requester: 'grace@aperture.dev', priority: 'normal', status: 'open' },
  { id: 3, subject: 'SSO loops on consent', requester: 'linus@monolith.fr', priority: 'urgent', status: 'pending' },
];

export const session: Session = { token: 'token-1', agent: { id: 1, name: 'Ada Lovelace' } };
