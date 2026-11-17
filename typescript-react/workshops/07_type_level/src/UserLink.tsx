// A link to a user's page: it takes a UserId, never a plain string, never an OrderId.
import type { ReactNode } from 'react';
import type { UserId } from './brand.ts';

export function UserLink({ id, children }: { id: UserId; children: ReactNode }) {
  return <a href={`/users/${id}`}>{children}</a>;
}
