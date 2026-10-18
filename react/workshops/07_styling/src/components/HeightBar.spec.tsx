import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeightBar } from './HeightBar';

describe('HeightBar', () => {
  it('is a meter exposing the height and the maximum', () => {
    render(<HeightBar height={172} max={202} />);

    const meter = screen.getByRole('meter', { name: 'Height' });
    expect(meter).toHaveAttribute('aria-valuenow', '172');
    expect(meter).toHaveAttribute('aria-valuemax', '202');
  });

  it('sets its width, inline, to the share of the maximum', () => {
    render(<HeightBar height={101} max={202} />);

    expect(screen.getByRole('meter', { name: 'Height' })).toHaveStyle({ width: '50%' });
  });

  it('rounds the width to a whole percent', () => {
    render(<HeightBar height={172} max={202} />);

    expect(screen.getByRole('meter', { name: 'Height' })).toHaveStyle({ width: '85%' });
  });

  it('never overflows its track', () => {
    render(<HeightBar height={300} max={202} />);

    expect(screen.getByRole('meter', { name: 'Height' })).toHaveStyle({ width: '100%' });
  });
});
