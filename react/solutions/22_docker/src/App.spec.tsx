import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  afterEach(() => {
    delete window.__ENV__;
    window.history.replaceState(null, '', '/');
  });

  it('lists the people, each one linking to its own page', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Leia Organa' })).toHaveAttribute('href', '/people/leia-organa');
  });

  it('renders the person of a deep link', () => {
    window.history.replaceState(null, '', '/people/leia-organa');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Leia Organa' })).toBeInTheDocument();
  });

  it('shows the API base URL the container was started with', () => {
    window.__ENV__ = { API_BASE_URL: 'https://swapi.example.com/api', APP_ENVIRONMENT: 'staging' };

    render(<App />);

    expect(screen.getByText('https://swapi.example.com/api')).toBeInTheDocument();
    expect(screen.getByText('staging')).toBeInTheDocument();
  });
});
