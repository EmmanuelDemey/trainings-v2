import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FavoritesProvider, useFavorites } from './FavoritesContext';
import { FilterProvider, useFilter } from './FilterContext';

describe('FavoritesContext', () => {
  it('starts with no favorite', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite('1')).toBe(false);
  });

  it('toggles a favorite on, then off', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider });

    act(() => result.current.toggle('1'));
    expect(result.current.isFavorite('1')).toBe(true);
    expect(result.current.favorites).toEqual(['1']);

    act(() => result.current.toggle('1'));
    expect(result.current.isFavorite('1')).toBe(false);
  });

  it('clears every favorite', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider });
    act(() => result.current.toggle('1'));
    act(() => result.current.toggle('5'));

    act(() => result.current.clear());

    expect(result.current.favorites).toEqual([]);
  });

  it('throws a helpful error when used outside its provider', () => {
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useFavorites())).toThrow('useFavorites must be used inside a <FavoritesProvider>');
  });

  it('does not re-render a favorites consumer when the filter changes — two contexts, not one', async () => {
    function FilterInput() {
      const { filter, setFilter } = useFilter();
      return <input aria-label="Filter" value={filter} onChange={(event) => setFilter(event.target.value)} />;
    }
    function FavoritesCount() {
      const { favorites } = useFavorites();
      return <p>Favorites: {favorites.length}</p>;
    }
    const onRender = vi.fn();

    render(
      <FilterProvider>
        <FavoritesProvider>
          <FilterInput />
          <Profiler id="favorites-count" onRender={onRender}>
            <FavoritesCount />
          </Profiler>
        </FavoritesProvider>
      </FilterProvider>,
    );
    await userEvent.type(screen.getByLabelText('Filter'), 'luke');

    expect(screen.getByLabelText('Filter')).toHaveValue('luke');
    // The mount, and nothing else: four keystrokes never reached the counter.
    expect(onRender).toHaveBeenCalledOnce();
  });
});
