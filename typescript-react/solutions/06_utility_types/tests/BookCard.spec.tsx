import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookCard } from '../src/BookCard.tsx';
import { maus } from './fixtures.ts';

test('shows the title and the author only, even when given a whole book', () => {
  render(<BookCard {...maus} />);
  expect(screen.getByRole('heading').textContent).toBe('Maus');
  expect(screen.getByRole('article').textContent).toBe('MausArt Spiegelman');
});
