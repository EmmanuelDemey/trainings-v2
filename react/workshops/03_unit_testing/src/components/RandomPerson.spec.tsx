import { describe, it } from 'vitest';

/**
 * STEP 4 — User events, and a spy that makes randomness deterministic.
 *
 * `const user = userEvent.setup()` BEFORE `render`, then `await user.click(…)`.
 * `using _random = vi.spyOn(Math, 'random').mockReturnValue(…)` — no
 * `mockRestore()`: `using` restores the spy at the end of the test.
 */
describe('RandomPerson', () => {
  it.todo('shows nobody before the first click');
  it.todo('shows the person the random draw lands on');
  // TODO 4.3: `mockReturnValueOnce(0).mockReturnValueOnce(0.99)` — the two edges.
  it.todo('can land on the first and on the last person');
});
