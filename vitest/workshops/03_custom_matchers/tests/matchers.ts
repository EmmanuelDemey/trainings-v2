import type { MatcherResult, MatcherState } from 'vitest';
import { isValidIsbn } from '../src/isbn';
import type { Receipt } from '../src/receipt';

/** TODO — Step 1: passes on a string that is a valid ISBN-13 — src/isbn.ts knows how. */
export function toBeValidIsbn(this: MatcherState, received: unknown): MatcherResult {
  return { pass: false, message: () => 'TODO' };
}

/**
 * TODO — Step 2: passes when the receipt totals `expected` cents. A receipt whose
 * total contradicts its own lines fails — even under `.not`.
 */
export function toTotal(this: MatcherState, received: Receipt, expected: number): MatcherResult {
  return { pass: false, message: () => 'TODO' };
}
