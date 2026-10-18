import { describe, expect, it } from 'vitest';
import { favoritesReducer } from './favoritesReducer';

describe('favoritesReducer', () => {
  it('adds a character that is not a favorite yet', () => {
    expect(favoritesReducer(['1'], { type: 'toggled', id: '5' })).toEqual(['1', '5']);
  });

  it('removes a character that already is a favorite', () => {
    expect(favoritesReducer(['1', '5'], { type: 'toggled', id: '1' })).toEqual(['5']);
  });

  it('empties the favorites when they are cleared', () => {
    expect(favoritesReducer(['1', '5'], { type: 'cleared' })).toEqual([]);
  });

  it('never mutates the state it receives', () => {
    const state = Object.freeze(['1', '5']);

    expect(() => favoritesReducer(state, { type: 'toggled', id: '10' })).not.toThrow();
    expect(() => favoritesReducer(state, { type: 'toggled', id: '1' })).not.toThrow();
    expect(state).toEqual(['1', '5']);
  });

  it('returns a NEW array when something changes — React compares by reference', () => {
    const state = ['1'];

    expect(favoritesReducer(state, { type: 'toggled', id: '5' })).not.toBe(state);
  });

  it('returns the SAME array when clearing nothing, so React can skip the render', () => {
    const empty: string[] = [];

    expect(favoritesReducer(empty, { type: 'cleared' })).toBe(empty);
  });
});
