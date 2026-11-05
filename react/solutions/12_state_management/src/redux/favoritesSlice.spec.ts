import { describe, expect, it } from 'vitest';
import {
  cleared,
  favoritesSlice,
  selectFavoriteCount,
  selectFavoriteIds,
  selectIsFavorite,
  toggled,
} from './favoritesSlice';

const reducer = favoritesSlice.reducer;

describe('favoritesSlice', () => {
  it('starts with no favorite', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({ ids: [] });
  });

  it('adds a character that is not a favorite yet', () => {
    expect(reducer({ ids: ['1'] }, toggled('5'))).toEqual({ ids: ['1', '5'] });
  });

  it('removes a character that already is a favorite', () => {
    expect(reducer({ ids: ['1', '5'] }, toggled('1'))).toEqual({ ids: ['5'] });
  });

  it('empties the favorites when they are cleared', () => {
    expect(reducer({ ids: ['1', '5'] }, cleared())).toEqual({ ids: [] });
  });

  it('never mutates the state it receives — Immer hands the reducer a draft', () => {
    const state = Object.freeze({ ids: Object.freeze(['1']) as string[] });

    const next = reducer(state, toggled('5'));

    expect(state.ids).toEqual(['1']);
    expect(next).not.toBe(state);
  });

  it('names its actions after the slice', () => {
    expect(toggled('1')).toEqual({ type: 'favorites/toggled', payload: '1' });
    expect(cleared().type).toBe('favorites/cleared');
  });

  it('reads the root state through its selectors', () => {
    const rootState = { favorites: { ids: ['1', '5'] } };

    expect(selectFavoriteIds(rootState)).toEqual(['1', '5']);
    expect(selectFavoriteCount(rootState)).toBe(2);
    expect(selectIsFavorite(rootState, '5')).toBe(true);
    expect(selectIsFavorite(rootState, '3')).toBe(false);
  });
});
