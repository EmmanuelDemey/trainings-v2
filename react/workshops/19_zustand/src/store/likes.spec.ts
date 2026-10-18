import { beforeEach, describe, expect, it, vi } from 'vitest';
import { selectIsLiked, selectLikeCount, useLikes } from './likes';

// A Zustand store is a module-level singleton: what one test likes, the next
// one would see. Put it back to its initial state — and empty the storage the
// `persist` middleware writes to — before every test.
beforeEach(() => {
  localStorage.clear();
  useLikes.setState(useLikes.getInitialState(), true);
});

describe('the likes store, used outside React', () => {
  it('starts with nobody liked', () => {
    expect(useLikes.getState().likedIds).toEqual([]);
  });

  it('like adds the person to the liked ones', () => {
    useLikes.getState().like('1');
    useLikes.getState().like('4');

    expect(useLikes.getState().likedIds).toEqual(['1', '4']);
  });

  it('liking someone already liked keeps a single like and notifies nobody', () => {
    useLikes.getState().like('1');
    const listener = vi.fn();
    const unsubscribe = useLikes.subscribe(listener);

    useLikes.getState().like('1');
    unsubscribe();

    expect(useLikes.getState().likedIds).toEqual(['1']);
    expect(listener).not.toHaveBeenCalled();
  });

  it('unlike removes that person only', () => {
    useLikes.setState({ likedIds: ['1', '4', '5'] });

    useLikes.getState().unlike('4');

    expect(useLikes.getState().likedIds).toEqual(['1', '5']);
  });

  it('reset forgets every like', () => {
    useLikes.setState({ likedIds: ['1', '4'] });

    useLikes.getState().reset();

    expect(useLikes.getState().likedIds).toEqual([]);
  });
});

describe('the selectors', () => {
  it('selectIsLiked tells whether one given person is liked', () => {
    useLikes.setState({ likedIds: ['1'] });
    const state = useLikes.getState();

    expect(selectIsLiked('1')(state)).toBe(true);
    expect(selectIsLiked('4')(state)).toBe(false);
  });

  it('selectLikeCount counts the liked people', () => {
    expect(selectLikeCount(useLikes.getState())).toBe(0);

    useLikes.setState({ likedIds: ['1', '4', '5'] });

    expect(selectLikeCount(useLikes.getState())).toBe(3);
  });
});

describe('persistence', () => {
  it('remembers the likes after a reload of the page', async () => {
    useLikes.getState().like('1');
    useLikes.getState().like('5');

    // A reload, as far as the store is concerned: the module runs again from
    // scratch, and creates a brand-new store.
    vi.resetModules();
    const reloaded = await import('./likes');

    expect(reloaded.useLikes.getState().likedIds).toEqual(['1', '5']);
  });

  it('saves the likes under the "star-wars-likes" key of localStorage', () => {
    useLikes.getState().like('4');

    const saved = JSON.parse(localStorage.getItem('star-wars-likes') ?? '{}');
    expect(saved.state).toEqual({ likedIds: ['4'] });
  });
});
