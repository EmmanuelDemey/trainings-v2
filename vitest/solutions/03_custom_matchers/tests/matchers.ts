import type { MatcherResult, MatcherState } from 'vitest';
import { isValidIsbn } from '../src/isbn';
import type { Receipt } from '../src/receipt';

export function toBeValidIsbn(this: MatcherState, received: unknown): MatcherResult {
  const pass = typeof received === 'string' && isValidIsbn(received);
  return {
    pass,
    message: () =>
      `expected ${this.utils.printReceived(received)} ${this.isNot ? 'not ' : ''}to be a valid ISBN-13`,
  };
}

export function toTotal(this: MatcherState, received: Receipt, expected: number): MatcherResult {
  const fromLines = received.lines.reduce((sum, line) => sum + line.quantity * line.priceInCents, 0);
  if (fromLines !== received.totalInCents) {
    return {
      // A receipt that contradicts itself is never right — not even under `.not`.
      pass: this.isNot,
      message: () =>
        `the receipt says ${this.utils.printReceived(received.totalInCents)} but its lines add up to ${this.utils.printExpected(fromLines)}`,
    };
  }
  return {
    pass: received.totalInCents === expected,
    message: () =>
      `expected the receipt ${this.isNot ? 'not ' : ''}to total ${this.utils.printExpected(expected)}, it totals ${this.utils.printReceived(received.totalInCents)}`,
    actual: received.totalInCents,
    expected,
  };
}
