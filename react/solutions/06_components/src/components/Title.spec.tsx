import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Title } from './Title';

describe('Title', () => {
  it('renders its text as a level-1 heading by default', () => {
    render(<Title text="Star Wars people" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
  });

  it('renders the heading level it is given', () => {
    render(<Title text="Characters" level={2} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Characters' })).toBeInTheDocument();
  });
});
