import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('is a region named by its title', () => {
    render(<Card title="Search">content</Card>);

    const region = screen.getByRole('region', { name: 'Search' });
    expect(within(region).getByRole('heading', { level: 2, name: 'Search' })).toBeInTheDocument();
  });

  it('renders its children inside the region', () => {
    render(
      <Card title="Search">
        <button type="button">Go</button>
      </Card>,
    );

    expect(within(screen.getByRole('region', { name: 'Search' })).getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('renders the footer it is given', () => {
    render(
      <Card title="Characters" footer={<strong>10 characters</strong>}>
        content
      </Card>,
    );

    expect(within(screen.getByRole('contentinfo')).getByText('10 characters')).toBeInTheDocument();
  });

  it('renders no footer when none is given', () => {
    render(<Card title="Characters">content</Card>);

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
