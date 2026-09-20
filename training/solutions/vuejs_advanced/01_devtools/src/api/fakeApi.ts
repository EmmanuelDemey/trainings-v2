/**
 * The support desk of a small SaaS. No network, no latency: this workshop is
 * about reading the Devtools panel, not about waiting.
 */

export type TicketStatus = 'open' | 'pending' | 'closed';

export interface Ticket {
  id: number;
  subject: string;
  requester: string;
  status: TicketStatus;
  /** How long the ticket has been waiting, in minutes. */
  waitingMinutes: number;
}

const SUBJECTS: ReadonlyArray<[string, TicketStatus]> = [
  ['Billing address cannot be saved', 'open'],
  ['Invoice 4412 is missing the VAT line', 'open'],
  ['SSO login loops on the consent screen', 'open'],
  ['Export to CSV truncates long names', 'pending'],
  ['Password reset mail never arrives', 'open'],
  ['Dark mode flickers on first paint', 'closed'],
  ['Webhook retries are not exponential', 'pending'],
  ['Seat count does not match the billing page', 'open'],
  ['Timezone is wrong on the activity feed', 'closed'],
  ['Cannot remove a member from a project', 'open'],
  ['Search ignores accented characters', 'pending'],
  ['Billing portal returns a 502 on Safari', 'open'],
  ['API key rotation revokes the old key too early', 'open'],
  ['Attachments over 10 MB fail silently', 'pending'],
  ['Weekly digest counts deleted items', 'closed'],
  ['Invite link expires after one hour', 'open'],
  ['Audit log paginates backwards', 'closed'],
  ['Mobile layout overlaps the footer', 'pending'],
  ['Refund shows twice in the billing history', 'open'],
  ['Slack notifications stop after a rename', 'open'],
  ['Two-factor codes rejected for 30 seconds', 'pending'],
  ['Custom domain stuck on "verifying"', 'open'],
  ['Usage graph is empty on the first day', 'closed'],
  ['Trial banner shows for paying customers', 'open'],
];

const REQUESTERS = [
  'ada@northwind.io',
  'grace@aperture.dev',
  'linus@monolith.fr',
  'margaret@apollo.space',
  'alan@enigma.uk',
  'barbara@voyager.nasa',
];

/**
 * Deterministic on purpose: everyone in the room reads the same numbers, and the
 * specs can assert on them.
 */
export function loadTickets(): Ticket[] {
  return SUBJECTS.map(([subject, status], index) => ({
    id: 4400 + index,
    subject,
    requester: REQUESTERS[index % REQUESTERS.length]!,
    status,
    waitingMinutes: ((index * 37) % 289) + 3,
  }));
}
