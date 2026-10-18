import { describe, expect, it } from 'vitest';
import { initialNavigation, navigationReducer, type NavigationState } from './navigation';

describe('navigationReducer', () => {
  it('starts on the home page', () => {
    expect(initialNavigation).toEqual({ page: 'home' });
  });

  it('shows the person page of the selected person', () => {
    const next = navigationReducer({ page: 'home' }, { type: 'showPerson', personId: '4' });

    expect(next).toEqual({ page: 'person', personId: '4' });
  });

  it('goes back home from a person page', () => {
    const next = navigationReducer({ page: 'person', personId: '4' }, { type: 'goHome' });

    expect(next).toEqual({ page: 'home' });
  });

  it('returns a new state instead of mutating the previous one', () => {
    const previous: NavigationState = Object.freeze({ page: 'home' });

    const next = navigationReducer(previous, { type: 'showPerson', personId: '1' });

    expect(next).not.toBe(previous);
    expect(previous).toEqual({ page: 'home' });
  });

  it('returns the very same state when already home, so React can skip the render', () => {
    const home: NavigationState = { page: 'home' };

    expect(navigationReducer(home, { type: 'goHome' })).toBe(home);
  });
});
