import { describe, it } from 'vitest';

/**
 * STEP 1 — Pure functions: input in, output out, no setup.
 *
 * Import `expect` (and `vi` for 1.3) from 'vitest' and the functions from
 * './format' as you need them.
 */
describe('formatHeight', () => {
  it.todo('converts centimetres to metres with two decimals');
  it.todo('keeps two decimals for a round value');
  // TODO 1.2: one `it.each([undefined, 'unknown'])` for both cases.
  it.todo('shows "unknown" for a missing or unknown height');
  // TODO 1.3: `using warn = vi.spyOn(console, 'warn').mockImplementation(() => {})`,
  //           then assert the exact message, called exactly once.
  it.todo('warns about an unparsable height and shows "unknown"');
  // TODO 1.4: map four heights through `formatHeight`, and assert the array with
  //           an empty `toMatchInlineSnapshot()` — Vitest writes it on the first run.
  it.todo('formats a whole column the same way');
});

describe('formatMass', () => {
  it.todo('appends the unit');
  it.todo('drops the thousands separator the API sends');
  it.todo('shows "unknown" for a missing or unknown mass');
});
