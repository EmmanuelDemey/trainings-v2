import * as z from 'zod';
import { ConcertSchema, type Concert } from './schemas/concert';

/**
 * One concert from the API. A payload that does not match the schema is a bug
 * on the other side of the wire: let the `ZodError` fly.
 */
export function parseConcert(payload: unknown): Concert {
  return ConcertSchema.parse(payload);
}

export interface Rejected {
  /** Position of the rejected entry in the payload. */
  index: number;
  issues: z.core.$ZodIssue[];
}

export interface Partitioned {
  valid: Concert[];
  rejected: Rejected[];
}

/**
 * A list of concerts from a partner feed: one broken entry must not hide the
 * others. Keep the valid ones, and report where each rejected one was and why.
 */
export function partitionConcerts(payload: unknown[]): Partitioned {
  const valid: Concert[] = [];
  const rejected: Rejected[] = [];

  payload.forEach((entry, index) => {
    const result = ConcertSchema.safeParse(entry);
    if (result.success) {
      valid.push(result.data);
    } else {
      rejected.push({ index, issues: result.error.issues });
    }
  });

  return { valid, rejected };
}
