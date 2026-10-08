import type * as z from 'zod';
import type { Concert } from './schemas/concert';

/**
 * TODO 3: one concert from the API. A payload that does not match the schema is
 * a bug on the other side of the wire: let the `ZodError` fly.
 */
export function parseConcert(payload: unknown): Concert {
  throw new Error(`TODO 3: parse ${JSON.stringify(payload)}`);
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
 * TODO 4: a list of concerts from a partner feed — one broken entry must not
 * hide the others. Keep the valid ones, and report where each rejected one was
 * and why. This function never throws.
 */
export function partitionConcerts(payload: unknown[]): Partitioned {
  return { valid: [], rejected: payload.map((_, index) => ({ index, issues: [] })) };
}
