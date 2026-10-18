import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('shows "Star Wars people" as the page title', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
  });

  it('introduces the application in a short paragraph', () => {
    render(<App />);

    expect(screen.getByText(/browse the characters of the star wars saga/i)).toBeInTheDocument();
  });

  it('no longer shows the Vite welcome text', () => {
    render(<App />);

    expect(screen.queryByText(/vite \+ react/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hmr/i)).not.toBeInTheDocument();
  });

  it('renders the title through the Header component', () => {
    const { container } = render(<App />);

    expect(container.querySelector('header')).toHaveTextContent('Star Wars people');
  });
});
