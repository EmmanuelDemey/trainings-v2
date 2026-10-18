import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders its title as the level-1 heading', () => {
    render(<Header title="Star Wars people" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
  });

  it('renders the subtitle under the title when one is given', () => {
    render(<Header title="Star Wars people" subtitle="A React 19 training" />);

    expect(screen.getByText('A React 19 training')).toBeInTheDocument();
  });

  it('renders no paragraph when there is no subtitle', () => {
    const { container } = render(<Header title="Star Wars people" />);

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });
});
