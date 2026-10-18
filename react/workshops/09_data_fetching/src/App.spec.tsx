import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('shows the details of the character clicked in the table', async () => {
    render(<App />);
    expect(screen.getByText('Select a character to see the details.')).toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: 'Obi-Wan Kenobi' }));

    const details = screen.getByRole('region', { name: 'Details' });
    expect(await within(details).findByRole('heading', { name: 'Obi-Wan Kenobi' })).toBeInTheDocument();
    expect(within(details).getByText('57BBY')).toBeInTheDocument();
  });
});
