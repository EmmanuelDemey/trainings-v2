import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('lists the characters, with no error', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  describe('when the filter crashes', () => {
    it('replaces only the filter with a fallback — the rest of the page survives', async () => {
      using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<App />);

      await userEvent.type(screen.getByLabelText('Filter by name'), 'Order 66');

      expect(screen.getByRole('alert')).toHaveTextContent('The filter crashed: Order 66 executed');
      expect(screen.queryByLabelText('Filter by name')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Star Wars people' })).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('brings back an empty filter, and every character, on "Reset the filter"', async () => {
      using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<App />);
      await userEvent.type(screen.getByLabelText('Filter by name'), 'Order 66');

      await userEvent.click(screen.getByRole('button', { name: 'Reset the filter' }));

      expect(screen.getByLabelText('Filter by name')).toHaveValue('');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Leia Organa' })).toBeInTheDocument();
    });
  });

  describe('when the details of a character crash', () => {
    it('shows a fallback in the details panel only', async () => {
      using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<App />);

      await userEvent.click(screen.getByRole('button', { name: 'IG-88' }));

      const details = screen.getByRole('region', { name: 'Details' });
      expect(within(details).getByRole('alert')).toHaveTextContent('This character cannot be displayed.');
      expect(screen.getByLabelText('Filter by name')).toBeInTheDocument();
    });

    it('recovers on its own when another character is selected', async () => {
      using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'IG-88' }));

      await userEvent.click(screen.getByRole('button', { name: 'Leia Organa' }));

      const details = screen.getByRole('region', { name: 'Details' });
      expect(within(details).getByRole('heading', { name: 'Leia Organa' })).toBeInTheDocument();
      expect(within(details).getByText('Alderaan')).toBeInTheDocument();
      expect(within(details).queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('liking a character — an error in an event handler', () => {
    it('counts the liked characters', async () => {
      render(<App />);

      await userEvent.click(screen.getByRole('button', { name: 'Like Luke Skywalker' }));
      await userEvent.click(screen.getByRole('button', { name: 'Like Leia Organa' }));

      expect(screen.getByText('Liked characters: 2')).toBeInTheDocument();
    });

    it('shows why a Sith Lord cannot be liked, and keeps the page working', async () => {
      render(<App />);

      await userEvent.click(screen.getByRole('button', { name: 'Like Darth Vader' }));

      const row = screen.getByRole('row', { name: /Darth Vader/ });
      expect(within(row).getByRole('alert')).toHaveTextContent('You cannot like a Sith Lord');
      expect(screen.getByText('Liked characters: 0')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Like Luke Skywalker' })).toBeInTheDocument();
    });
  });
});
