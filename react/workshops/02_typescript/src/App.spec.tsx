import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('describes the loaded people', () => {
    render(<App />);

    expect(screen.getByText('5 people loaded')).toBeInTheDocument();
  });

  it('lists the people grouped by gender, sorted by name', () => {
    render(<App />);

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'n/a',
      'male',
      'female',
    ]);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'C-3PO',
      'R2-D2',
      'Darth Vader',
      'Luke Skywalker',
      'Leia Organa',
    ]);
  });
});
