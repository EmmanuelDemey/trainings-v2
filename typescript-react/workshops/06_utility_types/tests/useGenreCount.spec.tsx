import { expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGenreCount } from '../src/useGenreCount.ts';
import { dune, maus } from './fixtures.ts';

test('counts the books of every genre, 0 when there is none', () => {
  const { result } = renderHook(() => useGenreCount([dune, maus, dune]));
  expect(result.current).toEqual({ novel: 2, essay: 0, comic: 1, poetry: 0 });
});
