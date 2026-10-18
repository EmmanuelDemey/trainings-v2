import { Profiler, type ProfilerOnRenderCallback } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { people } from '../data/people';
import { useLikes } from '../store/likes';
import { LikeButton } from './LikeButton';
import { LikesCounter } from './LikesCounter';

const luke = people.find((person) => person.name === 'Luke Skywalker')!;
const leia = people.find((person) => person.name === 'Leia Organa')!;

beforeEach(() => {
  localStorage.clear();
  useLikes.setState(useLikes.getInitialState(), true);
});

/** Records every commit of the tree it wraps: 'mount', then one 'update' per re-render. */
function recordCommits() {
  const commits: string[] = [];
  const onRender: ProfilerOnRenderCallback = (_id, phase) => {
    commits.push(phase);
  };
  return { commits, onRender };
}

describe('selectors keep re-renders where they belong', () => {
  it("liking Luke does not re-render Leia's like button", async () => {
    const user = userEvent.setup();
    const leiaButton = recordCommits();
    render(
      <>
        <LikeButton person={luke} />
        <Profiler id="leia" onRender={leiaButton.onRender}>
          <LikeButton person={leia} />
        </Profiler>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Like Luke Skywalker' }));

    expect(screen.getByRole('button', { name: 'Like Luke Skywalker' })).toHaveAttribute('aria-pressed', 'true');
    expect(leiaButton.commits).toEqual(['mount']);
  });

  it('the counter does not re-render when the likes change but not their number', () => {
    useLikes.setState({ likedIds: ['1'] });
    const counter = recordCommits();
    render(
      <Profiler id="counter" onRender={counter.onRender}>
        <LikesCounter />
      </Profiler>,
    );

    // Swap Luke's like for Leia's in a single update: the list changes, the
    // count does not.
    act(() => useLikes.setState({ likedIds: ['5'] }));

    expect(screen.getByRole('status')).toHaveTextContent('1 liked');
    expect(counter.commits).toEqual(['mount']);
  });
});
