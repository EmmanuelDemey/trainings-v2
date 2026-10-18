import { Profiler, type ReactNode } from 'react';
import { render } from '@testing-library/react';

/**
 * Renders `ui` inside a `<Profiler>` and counts the commits React makes.
 *
 * Every `setState` called from an effect costs one more commit: the screen is
 * first committed with the stale value, then again once the effect caught up.
 * Counting commits is how the specs prove an effect is gone — the final DOM
 * alone often looks the same either way.
 */
export function renderCountingCommits(ui: ReactNode) {
  let commits = 0;
  const result = render(
    <Profiler id="under-test" onRender={() => (commits += 1)}>
      {ui}
    </Profiler>,
  );
  return {
    ...result,
    /** The number of commits since the last `resetCommits()` (or the mount). */
    commits: () => commits,
    /** Forget the mount: count only what the next interaction causes. */
    resetCommits: () => {
      commits = 0;
    },
  };
}
