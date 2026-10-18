import { describe, it } from 'vitest';

/**
 * STEP 5 — Fake timers: the 300 ms debounce of the search, without waiting.
 *
 * `vi.useFakeTimers({ shouldAdvanceTime: true })` in a `beforeEach`,
 * `vi.useRealTimers()` in an `afterEach`, and
 * `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`. Move the clock
 * with `act(() => vi.advanceTimersByTime(ms))`. Import `SEARCH_DELAY` from
 * './App' rather than writing 300.
 */
describe('App search', () => {
  it.todo('shows everybody before any search');
  // TODO 5.2: type 'v', advance half the delay, type 'ader', advance half the
  //           delay again: still six rows.
  it.todo('does not filter while the user is still typing');
  it.todo('filters the table once the user stops typing');
  it.todo('shows the empty state when nobody matches');
});
